import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Opt-in flag for mock authentication (NOT automatic)
const useMockAuth = process.env.LOCAL_AUTH_MODE === 'mock';
const isLocalDevelopment = !process.env.REPL_ID && !process.env.REPLIT_DEPLOYMENT;

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID ?? "bittrader-pro-local"
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  // Generate a default secret for local development if not provided
  const sessionSecret = process.env.SESSION_SECRET || 
    (isLocalDevelopment ? 'local-dev-secret-change-in-production' : undefined);
  
  if (!sessionSecret) {
    throw new Error("SESSION_SECRET environment variable is required");
  }
  
  return session({
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: !isLocalDevelopment, // Disable secure cookies in local dev
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Only use mock auth if explicitly enabled via environment variable
  if (useMockAuth) {
    console.log("🔧 MOCK AUTH MODE - Using fake user (set LOCAL_AUTH_MODE=mock)");
    console.log("📝 Mock user: dev@localhost.com");
    
    // Create a default local user in the database
    try {
      await storage.upsertUser({
        id: "local-dev-user",
        email: "dev@localhost.com",
        firstName: "Local",
        lastName: "Developer",
        profileImageUrl: null,
      });
      console.log("✅ Mock user created");
    } catch (error) {
      console.error("❌ Error creating mock user:", error);
    }
    
    // Mock login endpoint
    app.get("/api/login", (req, res) => {
      (req as any).session.passport = {
        user: {
          claims: {
            sub: "local-dev-user",
            email: "dev@localhost.com",
            first_name: "Local",
            last_name: "Developer",
          },
          expires_at: Math.floor(Date.now() / 1000) + 86400,
        }
      };
      res.redirect("/");
    });
    
    app.get("/api/logout", (req, res) => {
      req.session.destroy(() => {
        res.redirect("/");
      });
    });
    
    return; // Skip OIDC setup
  }

  // Normal Replit Auth flow (works on both Replit and Ubuntu)
  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Keep track of registered strategies
  const registeredStrategies = new Set<string>();

  // Helper function to ensure strategy exists for a domain
  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Only auto-authenticate if mock mode is explicitly enabled
  if (useMockAuth) {
    if (!(req as any).session.passport) {
      (req as any).session.passport = {
        user: {
          claims: {
            sub: "local-dev-user",
            email: "dev@localhost.com",
            first_name: "Local",
            last_name: "Developer",
          },
          expires_at: Math.floor(Date.now() / 1000) + 86400,
        }
      };
    }
    (req as any).user = (req as any).session.passport.user;
    return next();
  }

  // Normal authentication flow
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

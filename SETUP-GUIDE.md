root@DESKTOP-CEFBLLD:~/BitTrade-Pro# npm run dev

> rest-express@1.0.0 dev
> NODE_ENV=development tsx server/index.ts

express-session deprecated req.secret; provide secret option file:/root/BitTrade-Pro/server/replitAuth.ts:1:761
file:///root/BitTrade-Pro/node_modules/openid-client/build/index.js:89
    const err = new TypeError(message, { cause });
                ^

TypeError: "clientId" must be a non-empty string
    at CodedTypeError (/root/BitTrade-Pro/node_modules/openid-client/src/index.ts:839:15)
    at new Configuration (/root/BitTrade-Pro/node_modules/openid-client/src/index.ts:1849:13)
    at Module.discovery (/root/BitTrade-Pro/node_modules/openid-client/src/index.ts:1281:20)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async memoize.maxAge (/root/BitTrade-Pro/server/replitAuth.ts:13:12)
    at async setupAuth (/root/BitTrade-Pro/server/replitAuth.ts:71:18)
    at async registerRoutes (/root/BitTrade-Pro/server/routes.ts:16:3)
    at async <anonymous> (/root/BitTrade-Pro/server/index.ts:50:18) {
  code: 'ERR_INVALID_ARG_TYPE',
  [cause]: undefined
}

Node.js v22.21.0
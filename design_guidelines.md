# Bitcoin Trading App - Design Guidelines

## Design Approach

**Selected Approach:** Design System with Trading Platform References

Drawing inspiration from industry-leading platforms (Coinbase, Binance, Robinhood) while maintaining a professional financial application aesthetic. This approach prioritizes data clarity, real-time information visibility, and efficient workflow patterns essential for trading applications.

**Core Principles:**
- Information hierarchy optimized for quick decision-making
- High-density data display without visual clutter
- Immediate visual feedback for trading actions
- Trust and professionalism through consistent patterns

---

## Typography System

**Font Stack:** 
- Primary: Inter or Manrope (via Google Fonts)
- Monospace: JetBrains Mono for numerical data, prices, timestamps

**Hierarchy:**
- Page Titles: 2.5rem (40px), font-weight: 700
- Section Headers: 1.75rem (28px), font-weight: 600
- Card Titles: 1.25rem (20px), font-weight: 600
- Body Text: 1rem (16px), font-weight: 400
- Small Labels: 0.875rem (14px), font-weight: 500
- Micro Text: 0.75rem (12px), font-weight: 400
- Price/Numbers: Use monospace font for all numerical values, varying sizes: 2rem for hero prices, 1.25rem for portfolio values, 0.875rem for table data

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16 (e.g., p-4, m-8, gap-6)

**Container Strategy:**
- Dashboard: Full-width layout with sidebar navigation (sidebar: w-64, main: flex-1)
- Content padding: px-6 py-8 for main sections
- Card spacing: p-6 for content cards, p-4 for compact data cards
- Grid gaps: gap-6 for main grids, gap-4 for dense data grids

**Responsive Breakpoints:**
- Mobile: Single column, collapsible sidebar
- Tablet (md): 2-column grids where appropriate
- Desktop (lg): Multi-column dashboard, persistent sidebar

---

## Component Library

### Navigation & Layout
**Sidebar Navigation:**
- Fixed left sidebar (w-64) with logo at top
- Navigation items with icons (Heroicons) + labels
- Active state indicators with subtle border or background treatment
- Collapsible on mobile (hamburger menu)

**Top Bar:**
- Account info and portfolio value summary (right-aligned)
- Notification bell icon with badge for alerts
- Settings/profile menu dropdown
- Height: h-16, px-6 padding

### Dashboard Components

**Hero Price Display:**
- Large Bitcoin price (text-5xl or text-6xl) with monospace font
- Percentage change indicator with up/down arrow icons
- Compact 24h high/low beneath
- Last updated timestamp (text-xs)
- Layout: Centered or left-aligned in dedicated card (p-8)

**Live Price Chart:**
- Full-width card spanning 2/3 of viewport width on desktop
- Chart library integration area (TradingView-style)
- Timeframe selector buttons (1H, 4H, 1D, 1W, 1M, 1Y) as pill buttons
- Volume bars beneath main chart
- Minimum height: h-96 on desktop, h-64 on mobile

**Portfolio Overview Card:**
- Grid layout (grid-cols-2 md:grid-cols-4)
- Each metric in its own cell: Total Value, Today's P/L, Total P/L, Available Balance
- Large numbers (text-2xl) with small labels (text-sm) above
- Icons (Heroicons: TrendingUpIcon, WalletIcon, etc.)

**Trading Bot Status Panel:**
- Prominent card with bot status indicator (Active/Inactive)
- Large toggle switch for bot control
- Current strategy name and brief description
- Quick stats: Trades today, Success rate, Active positions
- CTA button: "Configure Strategy" (primary button style)

**Recent Transactions Table:**
- Striped table rows for readability
- Columns: Time, Type (Buy/Sell), Amount (BTC), Price, Total, Status
- Monospace font for all numerical columns
- Status badges (pill-shaped with icons)
- Pagination controls at bottom
- Compact row height (h-12) for data density

**Strategy Configuration Panel:**
- Two-column layout: Controls on left, Preview/Summary on right
- Slider inputs for percentage-based values (risk tolerance, allocation)
- Number inputs for price thresholds (stop-loss, take-profit)
- Dropdown selects for strategy type
- Range indicators showing min/max values
- "Save Configuration" and "Start Bot" buttons at bottom

### Forms & Inputs

**Input Fields:**
- Height: h-12 for standard inputs
- Padding: px-4
- Border: border-2 with subtle radius (rounded-lg)
- Labels: text-sm, font-medium, mb-2
- Numerical inputs: Right-aligned text with monospace font
- Error states: Border change + error message (text-sm) below

**Buttons:**
- Primary: Large (h-12), bold labels (font-semibold), rounded-lg
- Secondary: Similar size, outline style
- Icon buttons: Square (w-10 h-10), rounded-full or rounded-lg
- Button groups: Use gap-3 spacing
- CTA buttons on images: Backdrop blur effect (backdrop-blur-md)

**Toggle Switches:**
- Large for critical functions (bot on/off): h-8 w-16
- Standard for settings: h-6 w-11
- Label positioning: left-aligned with switch right-aligned

### Data Display

**Stat Cards:**
- Minimum height: h-32
- Padding: p-6
- Icon in top-left or top-center
- Large value (text-3xl) with monospace font
- Small label (text-sm) above value
- Trend indicator (arrow + percentage) if applicable

**Alert/Notification Cards:**
- Border-left accent (border-l-4)
- Icon + title + description layout
- Timestamp (text-xs, opacity-70)
- Dismiss button (×) in top-right
- Padding: p-4

**Price Alert List:**
- Compact list items (py-3) with separators
- Trigger price (bold, monospace) + condition description
- Edit and Delete icon buttons (right-aligned)
- Empty state illustration when no alerts set

### Modals & Overlays

**Confirmation Dialogs:**
- Centered modal, max-w-md
- Header with icon + title
- Body with clear explanation
- Two-button footer: Cancel (secondary) + Confirm (primary/danger)
- Backdrop: semi-transparent overlay

**Trade Execution Modal:**
- Larger modal (max-w-2xl) for complex forms
- Multi-step if needed (Buy/Sell toggle at top)
- Amount input with max button
- Price preview calculation
- Estimated fees display
- Large "Execute Trade" button

---

## Images

**Logo/Branding:**
- Bitcoin logo icon in sidebar header (w-8 h-8)
- App wordmark next to logo

**Empty States:**
- Illustration for "No trading history yet" (w-48 h-48, centered)
- Illustration for "No active alerts" (w-40 h-40, centered)
- Simple line art or abstract graphics, not photographs

**No Hero Image:**
This is a utility-focused trading application. Instead of a hero section, the dashboard immediately presents actionable data: live price chart, portfolio overview, and bot controls occupy the primary viewport.

---

## Animation Guidelines

**Use Sparingly:**
- Smooth price updates: Subtle number transitions (duration-300)
- Chart rendering: Ease-in animation on initial load
- Loading states: Gentle skeleton screens or spinner
- **No distracting animations** on charts or data tables
- Modal enter/exit: Fade + scale (duration-200)

---

## Accessibility

- All form inputs have visible labels
- Focus states clearly visible on all interactive elements
- Error messages associated with their inputs
- Sufficient spacing between clickable elements (min h-10 for touch targets)
- Monospace fonts ensure numerical data alignment and scannability

---

## Page Structure

**Dashboard Layout (Primary View):**
1. Left Sidebar: Navigation menu (fixed, w-64)
2. Top Bar: Account summary + notifications (h-16)
3. Main Content Area (grid layout):
   - Row 1: Large price display + 24h stats (grid-cols-1 lg:grid-cols-3)
   - Row 2: Live chart (2/3 width) + Bot status panel (1/3 width) on desktop; stacked on mobile
   - Row 3: Portfolio overview cards (grid-cols-2 lg:grid-cols-4)
   - Row 4: Recent transactions table (full-width)

**Trading Bot Configuration Page:**
- Full-width form with left sidebar navigation still visible
- Header: Bot strategy selector + status indicator
- Two-column layout: Configuration form (left, 60%) + Live preview/summary (right, 40%)
- Sticky "Save & Activate" button at bottom

**Portfolio Page:**
- Detailed holdings table with expandable rows
- Performance chart at top (similar to dashboard chart)
- Transaction history below with advanced filters

**Settings Page:**
- Tabbed interface (Account, Security, Notifications, API Keys)
- Form-heavy with clear section divisions
- Breadcrumb navigation at top
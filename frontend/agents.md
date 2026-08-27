# QuickCourt — Frontend Implementation Plan

> **Product:** QuickCourt — Local Sports Booking Platform  
> **Version:** 1.0  
> **Stack Decision Required** → See Open Decisions below  
> **Design Reference:** See attached mockup image

---

## 🔓 Open Decisions (Requires Your Input Before Phase 1)

Before starting, the following decisions will significantly affect the architecture. Review each and pick an option.

---

### OD-01 — Framework

| Option | Pros | Cons |
|--------|------|------|
| **React + Vite** | Fast, flexible, huge ecosystem, easy to modularize by role | Manual routing, state management choices required |
| **Next.js (App Router)** | SSR for SEO, file-based routing, built-in API routes if needed | Slightly heavier, more opinionated |
| **React + Vite (Recommended)** | Best for a pure SPA booking platform where auth gates everything | ← Pick this unless SEO of venue pages matters |

> **Recommendation:** React + Vite. The platform is auth-gated, so SSR SEO benefit is minimal.  
> **Your call:** ___________

---

### OD-02 — Styling System

| Option | Pros | Cons |
|--------|------|------|
| **Vanilla CSS + CSS Variables** | Zero overhead, full control | Verbose for complex layouts |
| **CSS Modules** | Scoped styles, works well with React | Slightly more boilerplate |
| **Tailwind CSS** | Rapid prototyping, consistent spacing | Large class strings, needs config |

> **Recommendation:** CSS Modules + a global `design-system.css` with tokens (colors, spacing, typography).  
> **Your call:** ___________

---

### OD-03 — State Management

| Option | Use Case |
|--------|----------|
| **React Context + useReducer** | Simple, no extra deps, fine for auth state & user session |
| **Zustand** | Lightweight, minimal boilerplate, good for booking flow state |
| **Redux Toolkit** | Powerful but heavyweight; overkill for MVP |

> **Recommendation:** Zustand for global state (auth, booking cart) + React Query for server state (venue data, bookings).  
> **Your call:** ___________

---

### OD-04 — HTTP & Server State

| Option | Description |
|--------|-------------|
| **React Query (TanStack Query)** | Caching, loading/error states, refetch on focus — ideal for API-heavy apps |
| **SWR** | Simpler, Vercel-maintained, good for GET-heavy pages |
| **Axios + manual state** | Full control, more boilerplate |

> **Recommendation:** TanStack Query v5 + Axios.  
> **Your call:** ___________

---

### OD-05 — Chart Library (Owner & Admin Dashboards)

| Option | Charts Available |
|--------|-----------------|
| **Recharts** | Line, Bar, Area, Pie — React-native, composable |
| **Chart.js + react-chartjs-2** | Mature, many chart types including heatmap |
| **ApexCharts** | Rich feature set, heatmap built-in, good defaults |

> **Recommendation:** Recharts for Line/Bar/Pie + a simple custom heatmap component.  
> **Your call:** ___________

---

### OD-06 — UI Color Palette & Theme

The mockup uses a **green + dark** theme:

| Token | Mockup Value | Alternate |
|-------|-------------|-----------|
| Primary | `#2ECC71` (green) | Any |
| Primary Dark | `#27AE60` | — |
| Background | `#0F1117` (dark) | Light mode |
| Surface | `#1A1D2E` | — |
| Text Primary | `#FFFFFF` | — |
| Text Secondary | `#9CA3AF` | — |

> **Decision:** Do you want Dark Mode only, Light Mode only, or a toggle?  
> **Your call:** ___________

---

### OD-07 — Currency / Locale

The mockup uses **₹ (Indian Rupee)**. Confirm:

- Currency symbol: `₹`
- Date format: `DD MMM YYYY` (e.g., 15 May 2024)
- Time format: `12-hour` (e.g., 06:00 PM) or `24-hour`

> **Your call:** ___________

---

### OD-08 — Map Integration (Phase 2, plan now)

| Option | Notes |
|--------|-------|
| Google Maps Embed | Free tier, easy, requires API key |
| Mapbox GL JS | Better styling control, generous free tier |
| Leaflet + OpenStreetMap | Fully free, no API key |

> **Recommendation:** Skip for MVP, add Leaflet in Phase 2.  
> **Your call:** ___________

---

## 📐 Design System Foundations (Global, Pre-Phase)

Before writing any screen, set up the design system. This is the prerequisite for all phases.

### File: `src/styles/design-system.css`

Define once, use everywhere:

```css
/* Colors */
--color-primary: #2ECC71;
--color-primary-hover: #27AE60;
--color-primary-soft: rgba(46, 204, 113, 0.12);
--color-bg: #0F1117;
--color-surface: #1A1D2E;
--color-surface-2: #242838;
--color-border: rgba(255,255,255,0.08);
--color-text: #FFFFFF;
--color-text-muted: #9CA3AF;
--color-error: #EF4444;
--color-warning: #F59E0B;
--color-success: #10B981;

/* Typography */
--font-sans: 'Inter', system-ui, sans-serif;
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;

/* Spacing */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */

/* Radius */
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-full: 9999px;

/* Shadows */
--shadow-card: 0 4px 24px rgba(0,0,0,0.3);
--shadow-glow: 0 0 20px rgba(46,204,113,0.15);

/* Transitions */
--transition-fast: 150ms ease;
--transition-base: 250ms ease;
```

### Global Reusable Components (Built once, used across all phases)

| Component | Description |
|-----------|-------------|
| `<Button>` | Primary, Secondary, Ghost, Danger variants + loading state |
| `<Input>` | Text, Password, Search with label, error, icon slots |
| `<Badge>` | Status badges (CONFIRMED, PENDING, APPROVED, BANNED, etc.) |
| `<Card>` | Generic surface card with hover lift animation |
| `<Modal>` | Accessible overlay with backdrop |
| `<Toast>` | Notification toasts (success, error, warning, info) |
| `<Skeleton>` | Loading skeleton for cards, lists, tables |
| `<Avatar>` | User avatar with fallback initials |
| `<Spinner>` | Inline loading spinner |
| `<EmptyState>` | Icon + heading + message + optional CTA |
| `<Pagination>` | Page controls |
| `<Select>` | Custom styled dropdown |
| `<DatePicker>` | Calendar date selector for booking |
| `<Sidebar>` | Collapsible sidebar for owner/admin |
| `<TopNav>` | Role-aware top navigation bar |

---

## Phase 1 — Project Foundation & Auth Screens

**Goal:** Working project scaffold + fully functional authentication flow.

**Estimated Screens:** 4  
**Estimated Components:** 12 shared components

---

### 1.1 Project Scaffold

```
quickcourt-frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/          ← sports icons, logo
│   ├── components/      ← shared UI components
│   ├── styles/
│   │   └── design-system.css
│   ├── features/
│   │   ├── auth/
│   │   ├── venues/
│   │   ├── bookings/
│   │   ├── owner/
│   │   └── admin/
│   ├── hooks/           ← custom React hooks
│   ├── lib/
│   │   ├── axios.ts     ← configured Axios instance
│   │   └── queryClient.ts
│   ├── stores/          ← Zustand stores
│   │   └── authStore.ts
│   ├── router/
│   │   └── index.tsx    ← React Router config
│   ├── utils/
│   │   ├── formatters.ts ← currency, date, time formatters
│   │   └── validators.ts
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
└── package.json
```

---

### 1.2 Routing Architecture

```
/                          → Home (User, public)
/venues                    → Venues list (User, public)
/venues/:venueId           → Venue detail (User, public)
/venues/:venueId/book      → Booking flow (User, auth)
/bookings                  → My Bookings (User, auth)
/profile                   → Profile (User/Owner, auth)

/auth/login                → Login
/auth/register             → Register
/auth/verify-otp           → OTP Verification

/owner                     → Owner Dashboard (Owner, auth)
/owner/facilities          → Facility Management
/owner/facilities/new      → Add Facility
/owner/facilities/:id/edit → Edit Facility
/owner/courts              → Court Management
/owner/slots               → Time Slot Management
/owner/bookings            → Owner Booking Overview

/admin                     → Admin Dashboard (Admin, auth)
/admin/facilities          → Facility Approvals
/admin/users               → User Management
/admin/analytics           → Analytics
```

**Route Guards:**

```
<PublicRoute>    → Redirects logged-in users to their dashboard
<ProtectedRoute> → Redirects unauthenticated users to /auth/login
<RoleRoute>      → Redirects wrong-role users (e.g., user accessing /owner)
```

---

### Screen 1.A — Register Page (`/auth/register`)

**Layout:** Centered card on dark gradient background.

**Fields:**
- Full Name (text input)
- Email (email input)
- Password (password input with show/hide toggle)
- Confirm Password
- Role selector: `User` | `Facility Owner` (toggle buttons or styled radio)
- Avatar upload (optional at registration — upload or skip)

**Behaviors:**
- Real-time field validation (red border + error text below field)
- Password strength indicator (weak / medium / strong)
- Submit → calls `POST /api/auth/register`
- On success → redirect to `/auth/verify-otp`
- On error → show toast with message

**Open Decision for Register:**
- Avatar upload at registration → Required? Or allow skip and set later in profile?

---

### Screen 1.B — OTP Verification Page (`/auth/verify-otp`)

**Layout:** Centered card, large 6-digit OTP input boxes.

**Fields:**
- 6 individual digit inputs (auto-advance on type, auto-paste support)
- Resend OTP button (disabled with 60-second countdown after send)

**Behaviors:**
- Auto-submit when all 6 digits filled
- Resend OTP calls `POST /api/auth/register` again or a dedicated resend endpoint
- On success → redirect to login or directly log in user
- On error → shake animation on OTP boxes + error message

---

### Screen 1.C — Login Page (`/auth/login`)

**Layout:** Centered card, split-panel aesthetic (left: branding/hero, right: form) on desktop. Stacked on mobile.

**Fields:**
- Email
- Password (show/hide toggle)
- "Forgot Password?" link (Phase 2 feature, show as disabled/coming soon)

**Behaviors:**
- Submit → calls `POST /api/auth/login`
- On success → read role from response, redirect:
  - `USER` → `/`
  - `FACILITY_OWNER` → `/owner`
  - `ADMIN` → `/admin`
- On error → show inline error + toast

---

### Screen 1.D — Auth Layout Shell

Shared layout wrapping all `/auth/*` routes:

- Left panel: QuickCourt logo, tagline, animated sports graphic or gradient
- Right panel: Form content slot
- Responsive: stack vertically on mobile

---

## Phase 2 — User Role: Discovery & Venue Screens

**Goal:** Users can browse venues, search, filter, and view venue details.

**Estimated Screens:** 3  
**Dependencies:** Phase 1 complete, `GET /api/venues` and `GET /api/venues/:id` APIs live.

---

### Screen 2.A — Home Page (`/`)

**Sections:**

#### 2.A.1 — Hero / Welcome Banner

- Animated carousel (auto-play, manual dots navigation)
- 3–4 slides: "Book Local Sports Courts", popular sports promo, venue highlights
- CTA button: **Explore Venues** → navigates to `/venues`
- If logged in: personalize heading with user name

#### 2.A.2 — Popular Sports

- Horizontal scroll row of sport icon chips
- Sports: Badminton, Tennis, Football, Cricket, Basketball, Table Tennis
- Clicking a sport → navigates to `/venues?sport=<sport>`

#### 2.A.3 — Popular Venues

- Horizontal scroll row of venue cards (max 4–6 shown)
- Each card: image, name, sport tags, rating, price, location
- "View All" → `/venues`

#### 2.A.4 — Top Navigation Bar (Global)

| Element | Description |
|---------|-------------|
| Logo | QuickCourt wordmark + icon |
| Location selector | City/area dropdown (Delhi as default) |
| Search bar | Full-text search — submits to `/venues?q=<query>` |
| Notification bell | Phase 2 |
| Avatar / Login button | If logged in: avatar dropdown; if not: Login + Register buttons |

**Open Decision:**
- Location dropdown: hardcoded list of cities, or user-typed input, or browser geolocation?

---

### Screen 2.B — Venues Page (`/venues`)

**Layout:** Left sidebar filters (desktop) / Bottom sheet filters (mobile) + main content grid.

#### 2.B.1 — Venue Card

Each card displays:
- Venue image (16:9 aspect ratio)
- Venue name (bold)
- Sport type tags (colored chips)
- Rating (star + number)
- Location (pin icon + area, city)
- Starting price per hour (e.g., `₹500 /hr`)
- **View Details** button

#### 2.B.2 — Search Bar

- At top of content area
- Debounced (300ms) search by venue name or location
- URL-synced: `?q=cricket+arena`

#### 2.B.3 — Filters Panel

| Filter | UI Component | Values |
|--------|-------------|--------|
| Sport Type | Multi-select checkboxes | Badminton, Tennis, Football, Cricket, Basketball, Table Tennis |
| Price Range | Dual-handle range slider | ₹0 – ₹2000/hr |
| Venue Type | Radio buttons | Indoor / Outdoor / Both |
| Rating | Star click filter | 3+, 4+, 4.5+ |
| More Filters | Expandable panel | Amenities, etc. |

**Open Decision:**
- Filters: Apply on change (live) or show "Apply Filters" button?

#### 2.B.4 — Pagination

- Page numbers with prev/next arrows
- OR infinite scroll with "Load More" button at bottom
- **Open Decision:** Pagination style?

---

### Screen 2.C — Single Venue Page (`/venues/:venueId`)

**Layout:** Full-width hero image, then content below.

#### 2.C.1 — Hero Section

- Large banner image or photo gallery carousel
- Venue name (large heading)
- Rating + review count
- Sport type tags
- Location with map pin icon

#### 2.C.2 — Info Tabs or Sections

| Tab/Section | Content |
|-------------|---------|
| Overview | Description, about the venue |
| Courts | List of available courts (name, sport, price, hours) |
| Amenities | Icon grid (Parking, Changing Rooms, Cafeteria, etc.) |
| Photos | Masonry/grid photo gallery |
| Reviews | Review cards with rating + comment (Phase 2 for creation) |

#### 2.C.3 — Sticky Booking CTA

- Sticky bottom bar or sidebar (desktop): **Book Now** button
- Shows starting price
- Clicking → navigates to `/venues/:venueId/book`

#### 2.C.4 — Courts Preview

- Card list per court:
  - Court name
  - Sport type
  - Price per hour (₹)
  - Operating hours
  - **Book This Court** button

---

## Phase 3 — User Role: Booking Flow

**Goal:** Complete court → date → time → payment → confirmation booking flow.

**Estimated Screens:** 5 (as a stepped wizard)  
**Dependencies:** Phase 2 complete, Booking APIs live.

---

### Booking Flow Architecture

The booking flow is a **multi-step wizard** on a single page (`/venues/:venueId/book`), OR navigated sub-routes. 

**Open Decision:** Single page with step indicator, or separate routes per step?

Recommendation: Single page with stepper — smoother UX, no back-button weirdness.

```
Step 1: Select Sport
Step 2: Select Court
Step 3: Select Date & Time Slot
Step 4: Review Booking
Step 5: Payment
```

#### Stepper UI

```
① Sport  →  ② Court  →  ③ Date & Time  →  ④ Review  →  ⑤ Payment
```

- Completed steps shown with checkmark + green color
- Current step highlighted
- Users can click back to previous steps (not forward)

---

### Screen 3.A — Step 1: Select Sport

- List of sports supported by this venue (radio buttons with sport icons)
- Each option shows: sport name + icon
- Next button (disabled until selection made)

---

### Screen 3.B — Step 2: Select Court

- Shows courts filtered by selected sport
- Court cards:
  - Court name
  - Price per hour
  - Operating hours
  - Status badge (Active/Inactive)
- Radio select behavior — one court at a time
- Next button

---

### Screen 3.C — Step 3: Select Date & Time Slot

**Date Picker:**
- Inline calendar (month view)
- Only future dates selectable
- Today's date highlighted

**Time Slot Grid:**

After selecting date, load slots from `GET /api/courts/:courtId/availability?date=YYYY-MM-DD`.

Slot visual states:

| State | Color | Meaning |
|-------|-------|---------|
| Available | Green background | Bookable |
| Booked | Gray / strikethrough | Already taken |
| Blocked | Orange / strikethrough | Maintenance/private event |
| Selected | Primary green ring | User's current selection |

**Slot Selection Rules:**
- User selects start time → end time (duration selection)

**Open Decision:**
- Duration: Fixed 1-hour slots only? Or allow selecting multiple consecutive slots for a longer booking?

**Price Preview:**
- Shows dynamically: `1 hour × ₹500/hr = ₹500`

---

### Screen 3.D — Step 4: Review Booking

Summary card showing:

| Field | Value |
|-------|-------|
| Venue | Playarena Sports Center |
| Sport | Badminton |
| Court | Court 1 |
| Date | 15 May 2024 |
| Time | 06:00 PM – 07:00 PM |
| Duration | 1 hour |
| Price | ₹500 |
| **Total** | **₹500** |

- Edit links on each row to go back to that step
- **Proceed to Payment** button

---

### Screen 3.E — Step 5: Payment (Simulated)

**Payment Summary Panel:**
- Same booking details as review step
- Total amount prominently displayed
- "This is a simulated payment. No real money will be charged." disclaimer banner

**Payment Form:**
- Card number (fake/dummy input — no real gateway in MVP)
- Cardholder name
- Expiry (MM/YY)
- CVV

OR simpler approach:

**Open Decision:**
- Full dummy card form UI (feels real, good UX practice)?
- Or just a single "Pay ₹500" button with confirmation?

**On Payment:**
- Calls `POST /api/bookings`
- Loading state on button
- On success → navigate to confirmation
- On error (slot taken) → show "This slot is no longer available" modal, redirect to step 3

---

### Screen 3.F — Booking Confirmed

- Full-page success state
- Large animated checkmark (CSS or Lottie animation)
- Booking ID displayed: `#QC249612`
- Summary details
- Two CTAs:
  - **View My Bookings** → `/bookings`
  - **Go to Home** → `/`

---

## Phase 4 — User Role: My Bookings & Profile

**Goal:** Users can manage their bookings and profile.

**Estimated Screens:** 2  
**Dependencies:** Phase 1–3 complete.

---

### Screen 4.A — My Bookings (`/bookings`)

**Layout:** Tabs at top (Upcoming | Past | Cancelled), booking cards below.

#### Booking Card

| Element | Description |
|---------|-------------|
| Venue image thumbnail | Small, left side |
| Venue name | Bold |
| Court + Sport | Subtitle line |
| Date | Formatted date |
| Time | Start – End |
| Price | Right-aligned |
| Status Badge | CONFIRMED / CANCELLED / COMPLETED |
| Action buttons | Cancel (if eligible) / View Details |

**Cancellation Rules:**

**Open Decision:**
- Time window for cancellation: Can users cancel up to X hours before the booking? Or always? Or never after payment?
- Confirmation dialog before cancellation: Yes (recommended).

**Filters (Optional):**
- Date range picker
- Status filter dropdown

**Empty State:**
- "No upcoming bookings yet. Book a court to get started!" + Explore Venues button

---

### Screen 4.B — Profile Page (`/profile`)

**Layout:** Card with avatar on left, fields on right (desktop). Stacked (mobile).

**Displayed Info:**
- Avatar (large, with edit/upload button overlay)
- Full Name
- Email (read-only, since it's the login credential)
- Role badge
- Member since date

**Edit Mode:**
- Click "Edit Profile" → fields become editable
- Save / Cancel buttons appear
- Calls `PATCH /api/users/me`

**Quick Link:**
- "My Bookings" shortcut on profile page

---

## Phase 5 — Facility Owner Role

**Goal:** Owners can manage their facilities, courts, slots, and view bookings + analytics.

**Estimated Screens:** 7  
**Dependencies:** Phase 1 complete, all Owner APIs live.

---

### Layout: Owner Shell

All `/owner/*` routes share:

- **Left Sidebar** with navigation:
  - Dashboard
  - Facilities
  - Courts
  - Time Slots
  - Bookings
  - Profile
  - Logout
- **Top Bar:** Owner name, avatar, notification bell
- **Collapsible sidebar** on mobile (hamburger menu)

---

### Screen 5.A — Owner Dashboard (`/owner`)

#### KPI Cards (4 cards in a row)

| Card | Value | Sub-text |
|------|-------|----------|
| Total Bookings | 245 | +12% this week |
| Active Courts | 12 | +2 this week |
| Earnings (This Month) | ₹1,25,000 | +18% this month |
| Upcoming Bookings | 32 | Today |

#### Charts

**Chart 1: Booking Trend**
- Line chart (default) with toggle: Daily / Weekly / Monthly
- X-axis: dates, Y-axis: booking count
- Tooltip on hover

**Chart 2: Earnings Summary**
- Bar chart showing revenue over time
- OR Doughnut chart showing revenue split by court/sport
- **Open Decision:** Bar chart (trend over time) or Doughnut (composition)?

**Chart 3: Peak Booking Hours Heatmap**
- Grid: rows = time slots (06:00–22:00), columns = days of week
- Color intensity = booking frequency
- Tooltip showing exact count

**Upcoming Bookings Panel:**
- Mini-list of next 5 upcoming bookings with court, date, time, user name

---

### Screen 5.B — Facility Management (`/owner/facilities`)

**List View:**
- Table or card list of owner's facilities
- Columns: Name | Location | Sports | Status | Courts Count | Actions

**Status Badge Colors:**
- PENDING → Yellow
- APPROVED → Green
- REJECTED → Red

**Actions per facility:**
- Edit
- View Courts
- Delete (if PENDING/REJECTED only — cannot delete APPROVED with active bookings)

**Add Facility Button:** → opens `/owner/facilities/new`

---

### Screen 5.C — Add / Edit Facility (`/owner/facilities/new` & `/owner/facilities/:id/edit`)

**Form Fields:**

| Field | Input Type | Validation |
|-------|-----------|-----------|
| Facility Name | Text | Required, min 3 chars |
| Location (City/Area) | Text / Dropdown | Required |
| Full Address | Textarea | Required |
| Description | Rich text or Textarea | Required |
| Supported Sports | Multi-select checkbox | At least 1 required |
| Amenities | Multi-select chips | Optional |
| Photos | Multi-file upload | Max 10 images, 5MB each |
| Contact Phone | Tel input | Optional |
| Contact Email | Email input | Optional |

**Amenities Options:**
Parking, Changing Rooms, Showers, Cafeteria, First Aid, WiFi, Floodlights, CCTV, Equipment Rental

**Photo Upload:**
- Drag-and-drop zone + browse button
- Preview thumbnails with remove button
- Progress bar per upload

**Submission:**
- Submit → status set to PENDING
- Success toast: "Facility submitted for admin approval."
- Redirect to `/owner/facilities`

---

### Screen 5.D — Court Management (`/owner/courts`)

**Filter:** Facility selector dropdown (if owner has multiple facilities).

**Court List:** Table or card grid.

**Court Card:**

```
Court 1
Sport: Badminton
Price: ₹500/hour
Hours: 06:00 - 22:00
Status: Active  [Edit] [Delete]
```

**Add Court Modal / Drawer:**

| Field | Input | Validation |
|-------|-------|-----------|
| Court Name | Text | Required |
| Sport Type | Select | Required |
| Price per Hour | Number (₹) | Required, ≥ 0 |
| Opening Time | Time picker | Required |
| Closing Time | Time picker | Required, > Opening |
| Status | Toggle (Active/Inactive) | Default: Active |

**Open Decision:**
- Court management as a modal/drawer or a separate page?

---

### Screen 5.E — Time Slot Management (`/owner/slots`)

**Layout:** Calendar view (week or day view) showing all courts.

**Selectors at top:**
- Facility dropdown
- Court dropdown
- Date / week picker

**Slot Grid:**
- Rows = time slots (by hour or 30-min)
- Columns = courts (or days of week)
- Color coding:

| Color | State |
|-------|-------|
| Green | Available |
| Blue | Booked (user booking) |
| Orange | Blocked (maintenance) |
| Gray | Outside operating hours |

**Block Slot Action:**
- Click on available slot → opens Block Slot modal
- Fields: Date, Start Time, End Time, Reason (Maintenance / Private Event / Other)
- Save → slot turns orange, unavailable to users

**Unblock Action:**
- Click on blocked slot → "Remove Block" button → confirm → slot becomes available

---

### Screen 5.F — Owner Booking Overview (`/owner/bookings`)

**Layout:** Table with filters at top.

**Table Columns:**
User Name | Court | Sport | Date | Time | Amount | Status | Actions

**Filters:**
- Date range
- Court selector
- Status (CONFIRMED / CANCELLED / COMPLETED)

**Status Color Coding:**
- CONFIRMED → Blue
- CANCELLED → Red
- COMPLETED → Green

**Empty State:** "No bookings yet. Once customers book your courts, your bookings will appear here."

---

### Screen 5.G — Owner Profile (`/owner/profile` or shared `/profile`)

Same as User Profile (Screen 4.B) with owner-specific info if needed.

**Open Decision:**
- Shared profile route `/profile` for all roles, or separate `/owner/profile`?

---

## Phase 6 — Admin Role

**Goal:** Admins can manage the entire platform: approvals, users, analytics.

**Estimated Screens:** 5  
**Dependencies:** Phase 1 complete, all Admin APIs live.

---

### Layout: Admin Shell

All `/admin/*` routes share:

- **Left Sidebar:**
  - Dashboard
  - Facility Approvals
  - Users
  - Bookings
  - Analytics
  - Logout
- **Top Bar:** Admin label, avatar

---

### Screen 6.A — Admin Dashboard (`/admin`)

#### KPI Cards (4 cards in a row)

| Card | Metric |
|------|--------|
| Total Users | 1,250 |
| Facility Owners | 203 |
| Total Bookings | 3,245 |
| Active Courts | 645 |

Each card shows percentage change vs last period.

#### Quick Access Panels

| Panel | Content |
|-------|---------|
| Pending Approvals | Count with "Review Now" button |
| Recent Registrations | Last 5 user registrations |
| Recent Bookings | Last 5 platform bookings |

---

### Screen 6.B — Admin Analytics (`/admin/analytics`)

**Charts:**

| Chart | Type | Data |
|-------|------|------|
| Booking Activity Over Time | Line chart | Bookings per day/week/month |
| User Registration Trends | Bar chart | New users per week |
| Facility Approval Trend | Bar chart | Submitted / Approved / Rejected per month |
| Most Active Sports | Doughnut chart | Bookings by sport |
| Earnings Simulation | Bar chart | Revenue per facility/month |

**Global Time Range Selector:** Last 7 days / 30 days / 3 months / 1 year

---

### Screen 6.C — Facility Approvals (`/admin/facilities`)

**Tabs:** Pending | Approved | Rejected

**Pending Table Columns:**
Facility Name | Owner Name | Location | Sports | Submitted Date | Status | Actions

**Actions per facility:**
- **Approve** → opens confirm dialog with optional comment
- **Reject** → opens reject modal with required reason field
- **View Details** → opens a full detail panel/modal

**Facility Detail Panel:**
- All facility info (name, description, address, sports, amenities, photos)
- Owner contact info
- Submitted date
- Photo gallery
- Approve / Reject buttons at bottom

**Feedback on Decision:**
- Approval → toast + facility status updated to APPROVED
- Rejection → toast + rejection reason stored + owner notified (future)

---

### Screen 6.D — User Management (`/admin/users`)

**Layout:** Searchable, filterable table.

**Table Columns:**
Name | Email | Role | Status | Joined Date | Actions

**Search:** By name or email.

**Filters:**
- Role: USER / FACILITY_OWNER / ADMIN
- Status: ACTIVE / BANNED

**Actions per user:**
- **Ban** → confirm dialog → user status = BANNED
- **Unban** → confirm dialog → user status = ACTIVE
- **View Bookings** → opens booking history panel/modal

**Booking History Panel:**
- List of all bookings by this user
- Venue, court, date, time, amount, status

**Status Badges:**
- ACTIVE → Green
- BANNED → Red

---

### Screen 6.E — Platform Booking Overview (`/admin/bookings`)

Similar to Owner Booking Overview but platform-wide.

**Table Columns:**
User | Venue | Court | Sport | Date | Time | Amount | Status

**Filters:** Date range, status, sport, facility.

---

## Phase 7 — Polish, Responsiveness & Edge Cases

**Goal:** Production-quality UI: animations, loading states, empty states, error handling, full mobile responsiveness.

---

### 7.1 Loading States

Every data-fetching page must implement:

| Component | Loading UI |
|-----------|-----------|
| Venue list | Skeleton cards (same size as real cards) |
| Venue detail | Skeleton layout (hero + section placeholders) |
| Booking steps | Spinner overlay on "Next" button |
| Dashboards | KPI card skeletons + chart placeholder |
| Tables | Table row skeletons |

---

### 7.2 Error States

| Scenario | UI |
|----------|----|
| API down / 500 | Full page error with retry button |
| 404 Venue | "Venue not found" with back button |
| Slot taken at payment | Modal: "This slot was just booked. Please choose another time." + redirect to step 3 |
| Network error | Toast: "Unable to connect. Please check your internet connection." |
| Unauthorized | Redirect to login with "Please log in to continue" message |
| Banned user tries to book | Toast: "Your account has been suspended. Please contact support." |

---

### 7.3 Empty States

| Page | Empty Message |
|------|--------------|
| Venues page (no results) | "No venues found for your search. Try different filters." |
| My Bookings (no bookings) | "No bookings yet. Start by exploring venues!" + CTA |
| Owner Bookings (no bookings) | "No bookings yet. Once customers book your courts, they appear here." |
| Owner Courts (no courts) | "No courts added yet. Add your first court to get started." |
| Facility Approvals (no pending) | "All caught up! No pending facilities to review." |

---

### 7.4 Responsive Breakpoints

| Breakpoint | Width | Layout Behavior |
|-----------|-------|----------------|
| Mobile | < 768px | Single column, stacked layout, bottom nav or hamburger |
| Tablet | 768–1024px | 2 columns, collapsed sidebar |
| Desktop | > 1024px | Full sidebar + multi-column grids |

---

### 7.5 Micro-animations

| Interaction | Animation |
|------------|-----------|
| Button click | Scale 0.97 → 1.0 (spring) |
| Card hover | Translate Y -2px + shadow increase |
| Modal open/close | Scale + fade |
| Toast in/out | Slide from right + fade |
| Page transitions | Fade between routes |
| Booking confirmed checkmark | Draw animation (stroke-dashoffset) |
| Stepper step completion | Step indicator color fill animation |
| Slot selection | Background color transition 200ms |

---

### 7.6 Accessibility

- All interactive elements keyboard-navigable
- Focus rings visible
- ARIA labels on icon-only buttons
- Modal traps focus
- Color contrast meets WCAG AA minimum
- Form errors announced to screen readers

---

## Phase Summary Table

| Phase | Focus | Screens | Key Decisions |
|-------|-------|---------|--------------|
| Pre-Phase | Design System + Shared Components | 0 | Color theme, Typography |
| 1 | Auth (Register, OTP, Login) | 4 | Avatar required at signup? |
| 2 | User: Home, Venues, Venue Detail | 3 | Location selector, filter behavior, pagination style |
| 3 | User: Booking Flow + Payment | 6 | Step routing, slot duration, payment UI |
| 4 | User: My Bookings + Profile | 2 | Cancellation rules |
| 5 | Owner: Dashboard, Facilities, Courts, Slots, Bookings | 7 | Chart types, court mgmt UI, shared profile |
| 6 | Admin: Dashboard, Analytics, Approvals, Users | 5 | — |
| 7 | Polish: Loading, Error, Responsive, Animations | Cross-cutting | — |

---

## Consolidated Open Decisions Summary

| # | Decision | Default / Recommendation |
|---|----------|--------------------------|
| OD-01 | Framework | React + Vite |
| OD-02 | Styling | CSS Modules + design tokens |
| OD-03 | State Management | Zustand + React Query |
| OD-04 | HTTP Layer | TanStack Query v5 + Axios |
| OD-05 | Chart Library | Recharts |
| OD-06 | Theme | Dark mode (green + dark) |
| OD-07 | Currency/Locale | ₹, DD MMM YYYY, 12-hour time |
| OD-08 | Maps (Phase 2) | Leaflet + OpenStreetMap |
| OD-09 | Avatar required at register? | Optional (skip, set later) |
| OD-10 | Location filter: cities list or geolocation? | Hardcoded cities list for MVP |
| OD-11 | Venues filter: live or "Apply" button? | Live filter |
| OD-12 | Pagination style: pages or infinite scroll? | Paginated (better UX for filtering) |
| OD-13 | Booking flow: single page stepper or sub-routes? | Single page stepper |
| OD-14 | Slot duration: fixed 1 hour or multi-slot? | Fixed 1 hour (MVP), multi-slot Phase 2 |
| OD-15 | Payment UI: dummy card form or just "Pay" button? | Dummy card form (feels real) |
| OD-16 | Cancellation window: how many hours before? | 24 hours before (configurable) |
| OD-17 | Court management: modal/drawer or separate page? | Drawer (faster UX) |
| OD-18 | Profile: shared route or role-specific? | Shared `/profile` for all roles |
| OD-19 | Owner earnings chart: bar (trend) or doughnut (composition)? | Bar chart (trend) |

---

## Component Inventory (Total)

### Shared (Phase Pre / 1)

- Button, Input, Select, Textarea, Toggle, Checkbox, RadioGroup
- Card, Modal, Drawer, Toast, Badge, Avatar, Spinner, Skeleton
- EmptyState, ErrorBoundary, Pagination
- TopNav, Sidebar (Owner/Admin), MobileNav
- DatePicker, TimePicker, FileUpload
- StepperWizard, StepIndicator

### Domain Components

- VenueCard, VenueGrid, VenueHero
- SportChip, SportSelector
- CourtCard, CourtSelector
- SlotGrid, SlotBadge, SlotPicker
- BookingCard, BookingStatusBadge
- KPICard, Chart wrappers (LineChart, BarChart, DoughnutChart, Heatmap)
- FacilityCard, FacilityForm
- UserTableRow, UserActionsMenu
- FacilityApprovalCard, ApprovalModal

---

## API Integration Map

| Screen | API Calls |
|--------|-----------|
| Register | POST /api/auth/register |
| OTP | POST /api/auth/verify-otp |
| Login | POST /api/auth/login |
| Home | GET /api/venues (top 6) |
| Venues | GET /api/venues?q=&sport=&minPrice=&maxPrice= |
| Venue Detail | GET /api/venues/:id, GET /api/venues/:id/courts |
| Slot Picker | GET /api/courts/:courtId/availability?date= |
| Create Booking | POST /api/bookings |
| My Bookings | GET /api/bookings |
| Cancel Booking | PATCH /api/bookings/:id/cancel |
| Profile | GET /api/users/me, PATCH /api/users/me |
| Owner Dashboard | GET /api/owner/analytics |
| Owner Facilities | GET /api/facilities/my, POST /api/facilities, PATCH /api/facilities/:id |
| Owner Courts | GET /api/facilities/:id/courts, POST, PATCH /api/courts/:id |
| Owner Slots | GET /api/courts/:id/availability, POST /api/courts/:id/blocks |
| Owner Bookings | GET /api/owner/bookings |
| Admin Dashboard | GET /api/admin/dashboard |
| Admin Users | GET /api/admin/users, PATCH /api/admin/users/:id/ban |
| Facility Approval | GET /api/admin/facilities/pending, PATCH /api/admin/facilities/:id/approve |

---

*End of QuickCourt Frontend Implementation Plan — v1.0*

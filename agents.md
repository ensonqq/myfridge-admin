# MyFridge Admin – Project Overview

## Summary

**MyFridge Admin** is a Vue 2 single-page admin dashboard built for **MyFridge HK**, a Hong Kong fresh food delivery service. It is customised from the Creative Tim *Paper Dashboard Pro* template (v2.4.0) and provides full back-office operations including order management, user management, product/shop management, sales analytics, vouchers, prizes, and more.

The UI language is Traditional Chinese (繁體中文).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 2.6.14 |
| Router | Vue Router 3.5.2 |
| State | Vuex 3.5.1 |
| UI Library | Element UI 2.15.6 |
| HTTP Client | Axios 0.20.0 |
| Date Handling | Moment.js |
| Charts | Chart.js 2.9.3 + Vue-ChartJS |
| Calendar | FullCalendar 5.10.0 |
| Forms Validation | Vee-Validate 3.4.13 |
| Drag & Drop | VueDraggable |
| Alerts | SweetAlert2 11.1.8 |
| Progress Bar | NProgress |
| PDF Export | html2pdf.js, pdf-merger-js |
| Excel/PDF Utils | jspdf, xlsx.full.min (static) |
| Maps | D3, Datamaps, Google Maps |
| Styling | SCSS (Paper Dashboard theme) |
| Build Tool | Vue CLI 4.5.14 + Webpack |

---

## Project Structure

```
myfridge-admin/
├── public/                         # Static assets (fonts, images, flags)
├── src/
│   ├── main.js                     # App entry point
│   ├── App.vue                     # Root component
│   ├── sidebarLinks.js             # Sidebar navigation config (role-aware)
│   ├── api/
│   │   └── api.js                  # Axios instance, interceptors, helper methods
│   ├── assets/
│   │   ├── fonts/                  # Nucleo icon fonts
│   │   ├── images/                 # Payment icons etc.
│   │   └── sass/                   # SCSS entry files & Paper Dashboard theme
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── Layout/             # DashboardLayout wrapper
│   │   │   └── Views/              # All page views (organised by module)
│   │   ├── GeneralViews/           # 404 Not Found page
│   │   ├── Test/                   # Test/scratch components
│   │   └── UIComponents/           # Reusable UI (Buttons, Modal, Tabs, etc.)
│   ├── routes/
│   │   └── routes.js               # Vue Router route definitions
│   ├── store/
│   │   ├── index.js                # Vuex store setup
│   │   ├── state.js                # Global state shape
│   │   ├── mutations.js            # State mutations
│   │   └── actions.js              # Async actions (mostly empty; logic lives in components)
│   └── util/
│       ├── printOrders.js          # General order print utility
│       ├── printOrders_SF.js       # SF Express label print utility
│       ├── printOrders_SF202602.js # SF label variant (Feb 2026 format)
│       ├── printOrders_SF20260311.js # SF label variant (Mar 2026 format)
│       └── throttle.js             # Throttle helper
├── vue.config.js                   # Webpack/Vue CLI config
└── babel.config.js                 # Babel config
```

---

## Authentication & API

### API Endpoints (Axios instance in `src/api/api.js`)

| Environment | Base URL |
|---|---|
| Production (`m9sj7sd1.myfridgehk.com`) | `http://api.myfridgehk.com` |
| Dev (`admin-dev.myfridgehk.com`) | `http://api-dev.myfridgehk.com` |
| Local | `http://localhost:3001` |

The environment is auto-detected from `window.location.hostname`.

### Auth Flow

- **JWT Bearer tokens** stored in cookies:
  - `admin-access-token` – 14-day expiry
  - `admin-refresh-token` – 30-day expiry
- Request interceptor automatically attaches the `Authorization: Bearer <token>` header.
- Response interceptor catches `401` errors and calls `/v1/auth/refresh-tokens` to silently refresh the access token, then retries the original request.
- On refresh failure, `store.commit('logout')` is called and the user is redirected to login.

### Startup API Calls (called on app load)

| Method | Endpoint | Mutation |
|---|---|---|
| `api.myProfile()` | `GET /v1/auth/me` | `setUser` |
| `api.locations()` | `GET /v1/settings/locations` | `setLocations` |
| `api.holidays()` | `GET /v1/settings/holidays` | `setHolidays` |
| `api.skuSorting()` | `GET /v1/settings/skuSorting` | `setSkuSorting` |

---

## Vuex Store

| State Key | Type | Description |
|---|---|---|
| `user` | Object / null | Currently logged-in admin user |
| `locations` | Object / null | Delivery location configuration |
| `holidays` | Array | Holiday dates (formatted `YYYY-MM-DD`) |
| `skuSorting` | Array | Product SKU sort order |

Key mutations: `setUser`, `setTokens`, `logout`, `setLocations`, `setHolidays`, `setSkuSorting`.

---

## Modules & Routes

### Role-Based Access
Some sidebar items are gated by `roleRequired: 'super'` (super admin role).

### Feature Modules

| Module | Route(s) | Chinese Name | Notes |
|---|---|---|---|
| **Dashboard Overview** | `/admin/overview` | 主板 | Super admin only; shows today's turnover, orders, new members, monthly projections, top-up pool stats |
| **Sales** | `/sales/sales`, `/sales/topup` | 銷售 / 業積表 / 增值表 | Super admin only |
| **Monthly Ranking** | `/monthlyRank` | 每月排行 (Top 50) | Monthly star performance ranking |
| **Users** | `/users/admin`, `/users/member` | 用戶 / 管理員 / 會員 | User listing & detail (`/users/detail/:id`); KOL & Student roles exist but are hidden |
| **Orders** | `/orders/byCheckoutDay`, `/orders/byDeliveryDayV2` | 訂單 / 落單日 / 送貨日 | Order listing with date filters, status filter, bulk SF label printing; detail at `/orders/detail/:orderNumber` |
| **Shop** | `/shop/products`, `/shop/categories`, `/shop/gifts` | 商店 / 產品 / 類別 / 禮品 | Product catalogue management |
| **Credits / Top-up** | `/topup/topups`, `/topup/topupOrders` | 積分 / 積分卡 / 增值紀錄 | Top-up card management and transaction history |
| **Vouchers** | `/vouchers` | 優惠碼 | Discount code management |
| **Prizes** | `/prizes/all`, `/prizes/records` | 抽獎 / 抽獎活動 / 抽獎紀錄 | Lucky draw campaigns and draw history |
| **Promotions** | `/promotions` | 優惠Banner | Website banner/promotion management |
| **Retail Points** | `/retails` | 零售點 | Physical retail location management |
| **Settings** | `/settings` | 設定 | Application/system settings (locations, holidays, SKU sorting, etc.) |
| **Key Accounts** | `/keyAccounts/accounts`, `/keyAccounts/orders` | 商業客戶 | B2B accounts & orders (hidden in sidebar, routes exist) |
| **KOL Sales** | `/kol/sales` | KOL業積 | KOL performance ranking (hidden in sidebar) |
| **Invoices** | `/invoices` | 帳單 | Invoice management (hidden in sidebar) |
| **Credit Redemption** | `/credits/redemption` | 積分領取 | Credit redemption management (hidden in sidebar) |
| **Calendar** | `/calendar` | — | FullCalendar integration |

---

## Sidebar Navigation (`sidebarLinks.js`)

The sidebar is configured as a tree of link objects with optional `roleRequired` field. Items currently visible:

- 主板 (Dashboard) — super only
- 銷售 (Sales) — super only
- 每月排行 (Monthly Rank)
- 用戶 (Users)
- 訂單 (Orders)
- 商店 (Shop)
- 積分 (Credits/Top-up)
- 優惠碼 (Vouchers)
- 抽獎 (Prizes)
- 優惠Banner (Promotions)
- 零售點 (Retails)
- 設定 (Settings)

---

## Order Printing (SF Express)

The `src/util/` directory contains multiple SF Express label printing utilities:

- **`printOrders_SF.js`** – Base SF label printer
- **`printOrders_SF202602.js`** – Updated format (February 2026)
- **`printOrders_SF20260311.js`** – Latest format (March 2026)
- **`printOrders.js`** – General order print (non-SF)

These use `jspdf` (via `public/static/js/jspdf.debug.js`) for PDF generation, with support for batch-printing unprinted or selected orders.

---

## Development

### Commands

```bash
# Install dependencies
npm install

# Start dev server (opens browser)
npm run dev

# Production build
npm run build
```

### Environment Detection
No `.env` files are used; the API base URL is determined at runtime by `window.location.hostname` inside `src/api/api.js`.

### Key Configuration
- `vue.config.js` – Adds `src` path alias, limits Webpack chunks to 6, disables PWA plugin, enables CSS source maps in dev.
- `babel.config.js` – Babel preset env + Element UI component tree-shaking.

---

## Notes for AI Agents

- **Language**: UI text is in Traditional Chinese; code comments may mix English and Chinese.
- **Component convention**: Page views live in `src/components/Dashboard/Views/<Module>/`. Shared UI primitives live in `src/components/UIComponents/`.
- **API calls**: Most API logic is co-located inside Vue components (not in Vuex actions). `this.$api` is the global Axios instance.
- **Notifications**: `this.$notify` maps to Element UI `Notification`.
- **Date formatting**: `moment` is used throughout for date manipulation and display.
- **Printing**: SF Express label printing involves generating multi-page PDFs and merging them via `pdf-merger-js`.
- **Route meta**: `meta.title` on routes contains the Chinese page title shown in the UI.


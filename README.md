# Wishlist App — iOS

A full-stack mobile application for creating and sharing gift wishlists with social features, collective gifting, and an in-app coin economy.

**Stack:** React Native (iOS) + Express.js + PostgreSQL

---

## What the App Does

Wishlist App lets users:

- Create wishlists with items (title, price, link, priority, image)
- Share wishlists publicly or with friends via a deep link
- Allow guests to **reserve** items or **contribute money** toward them
- Donate **coins** (in-app currency) to help friends buy items
- Form **groups** for collective gift purchases
- Follow friends and view their activity in a **social feed**
- Get **AI-powered gift suggestions** based on context

---

## Project Structure

```
mobile/
├── README.md
├── SETUP.md                  # Developer setup guide (RU)
├── WishlistApp/              # React Native iOS frontend
├── backend/                  # Express.js API server
└── wishlist/                 # Legacy Swift project (archived)
```

---

## Frontend — `WishlistApp/`

React Native app targeting iOS, written in TypeScript.

### Architecture

```
WishlistApp/
├── App.tsx                   # App entry — providers (React Query, Toast, Navigation)
├── src/
│   ├── types/index.ts        # Shared TypeScript types
│   ├── navigation/           # Navigator stack
│   ├── screens/              # Full-screen views
│   ├── components/           # Reusable UI components
│   ├── hooks/                # Custom React hooks (data fetching)
│   ├── api/                  # Axios API call functions
│   └── store/                # Zustand global state
```

### Navigation

| File | Purpose |
|---|---|
| `navigation/RootNavigator.tsx` | Auth/app switching, deep link handling |
| `navigation/AuthNavigator.tsx` | Login & Register stack |
| `navigation/AppNavigator.tsx` | Main tab bar (My Lists, Feed, Friends, Wallet) |

### Screens

| Screen | Path | Description |
|---|---|---|
| Login | `screens/auth/LoginScreen.tsx` | Email/password login |
| Register | `screens/auth/RegisterScreen.tsx` | New account creation |
| Dashboard | `screens/dashboard/DashboardScreen.tsx` | User's wishlists list + FAB to create |
| Wishlist Detail | `screens/wishlist/WishlistDetailScreen.tsx` | Items in a wishlist, add/edit/delete |
| Public Wishlist | `screens/wishlist/PublicWishlistScreen.tsx` | Read-only view for PUBLIC wishlists |
| Guest Access | `screens/guest/GuestAccessScreen.tsx` | Deep-link landing page for guests |
| Friends | `screens/friends/FriendsScreen.tsx` | Friend requests and friends list |
| Friend Profile | `screens/friends/FriendProfileScreen.tsx` | View a friend's public profile |
| Feed | `screens/feed/FeedScreen.tsx` | Social feed of friends' recent items |
| Wallet | `screens/wallet/WalletScreen.tsx` | Coin balance and transaction history |
| Groups | `screens/groups/GroupsScreen.tsx` | Create and join groups |
| Group Detail | `screens/groups/GroupDetailScreen.tsx` | Group gift items and coin contributions |

### Components

**Common**
- `Button.tsx` — styled button
- `Input.tsx` — text input with label
- `LoadingOverlay.tsx` — full-screen loader
- `ErrorBanner.tsx` — inline error display
- `PriorityBadge.tsx` — MUST_HAVE / NORMAL / DREAM badge

**Wishlist**
- `WishlistCard.tsx` — list row for a wishlist
- `WishlistItemCard.tsx` — list row for an item
- `ItemFormModal.tsx` — create/edit item modal
- `GiftAdvisorModal.tsx` — AI gift suggestion modal

**Guest**
- `GuestItemCard.tsx` — read-only item card for guests
- `ContributionBar.tsx` — progress bar for monetary contributions

### State Management

| Layer | Library | Used For |
|---|---|---|
| Server state | React Query | All API data, caching, invalidation |
| Client state | Zustand | Auth token + current user (persisted) |
| HTTP | Axios | API requests with JWT interceptor |

### Custom Hooks

Each feature has a dedicated hook wrapping React Query calls:

| Hook | Responsibility |
|---|---|
| `useAuth` | Login/register mutations |
| `useWishlists` | List, create, update, delete wishlists |
| `useWishlistDetail` | Single wishlist + its items |
| `useFriends` | Friend requests, accept/decline, list |
| `useFeed` | Friends' activity feed |
| `useWallet` | Coin balance + transaction history |
| `useCoinDonations` | Donate coins to items |
| `useGroups` | Group CRUD and join by code |
| `useShareData` | Parse guest share token from deep link |

### API Layer

`src/api/client.ts` — Axios instance pointing to `http://localhost:3000`. Adds `Authorization: Bearer <token>` header automatically; logs out on 401.

Each module exports typed functions for one resource:
`auth.api.ts`, `wishlists.api.ts`, `items.api.ts`, `reservations.api.ts`, `contributions.api.ts`, `share.api.ts`, `friends.api.ts`, `wallet.api.ts`, `feed.api.ts`, `coinDonations.api.ts`, `groups.api.ts`, `ai.api.ts`

### Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| react-native | 0.84.1 | Mobile framework |
| @react-navigation/* | 7.x | Navigation |
| @tanstack/react-query | 5.90 | Server state |
| zustand | 4.5.7 | Client state |
| axios | 1.13.6 | HTTP client |
| phosphor-react-native | — | Icons |
| react-native-toast-message | — | Toast notifications |

---

## Backend — `backend/`

Express.js REST API written in TypeScript, backed by PostgreSQL via Prisma ORM.

### Architecture

```
backend/
├── src/
│   ├── index.ts              # Express app + route mounting
│   ├── config.ts             # Environment variable loading
│   ├── db.ts                 # Prisma client singleton
│   ├── middleware/
│   │   ├── auth.ts           # JWT requireAuth middleware
│   │   └── errorHandler.ts   # Global error handler
│   ├── routes/               # Route definitions (13 modules)
│   ├── controllers/          # Request handlers
│   ├── services/             # Business logic
│   └── utils/                # jwt, hash, shareToken helpers
└── prisma/
    ├── schema.prisma         # Database schema
    └── migrations/           # Migration history
```

### API Routes

| Prefix | File | Description |
|---|---|---|
| `/auth` | `routes/auth.ts` | Register, login, get current user |
| `/wishlists` | `routes/wishlists.ts` | Wishlist CRUD |
| `/items` | `routes/items.ts` | Wishlist item CRUD |
| `/reservations` | `routes/reservations.ts` | Guest item reservations |
| `/contributions` | `routes/contributions.ts` | Guest monetary contributions |
| `/share` | `routes/share.ts` | Public guest access via share token |
| `/parse-url` | `routes/parseUrl.ts` | Scrape metadata from a URL |
| `/ai` | `routes/ai.ts` | AI gift suggestions (OpenRouter) |
| `/friends` | `routes/friends.ts` | Friend requests and management |
| `/wallet` | `routes/wallet.ts` | Coin balance and transactions |
| `/feed` | `routes/feed.ts` | Friends' activity feed |
| `/coin-donations` | `routes/coinDonations.ts` | Coin donations to items |
| `/groups` | `routes/groups.ts` | Group CRUD, join, donate |

### Database Schema

Key models in `prisma/schema.prisma`:

| Model | Fields | Notes |
|---|---|---|
| `User` | email, passwordHash, coins, role, avatar | Roles: USER, ORG |
| `Wishlist` | title, description, occasion, visibility | PRIVATE / FRIENDS / PUBLIC |
| `Item` | title, price, url, imageUrl, priority, status | Priority: MUST_HAVE / NORMAL / DREAM |
| `Reservation` | itemId, guestName, guestEmail | One guest claims an item |
| `Contribution` | itemId, amount, guestName | Partial monetary contribution |
| `Friendship` | requesterId, addresseeId, status | PENDING / ACCEPTED / DECLINED |
| `CoinTransaction` | userId, amount, type | SIGNUP_BONUS / SENT / RECEIVED / DONATED / REFUNDED |
| `CoinDonation` | fromUserId, itemId, amount | User-to-item coin donation |
| `Group` | title, joinCode, creatorId | Collective gift group |
| `GroupMembership` | groupId, userId, isAdmin | |
| `GroupItem` | groupId, title, price, coinTarget | Group gift target |
| `GroupDonation` | groupItemId, userId, amount | Coin donation to group item |

### Services (Business Logic)

| Service | Responsibility |
|---|---|
| `auth.service.ts` | Password hashing, JWT generation, user lookup |
| `wishlists.service.ts` | Visibility access control (PRIVATE / FRIENDS / PUBLIC) |
| `items.service.ts` | Item ownership checks, status transitions |
| `reservations.service.ts` | Reserve / cancel item reservations |
| `contributions.service.ts` | Track guest monetary contributions |
| `share.service.ts` | Validate share tokens, return guest-safe data |
| `friendship.service.ts` | Check friendship status before allowing FRIENDS-visible content |
| `wallet.service.ts` | Coin ledger operations |
| `feed.service.ts` | Fetch friends' recent items |
| `coinDonations.service.ts` | Deduct coins from sender, credit to item |
| `groups.service.ts` | Group join via code, admin checks, group donations |

### Utilities

| File | Purpose |
|---|---|
| `utils/jwt.ts` | Sign and verify JWT tokens (30-day expiry) |
| `utils/hash.ts` | bcryptjs password hash / compare |
| `utils/shareToken.ts` | Generate unique nanoid share tokens |

### Key Dependencies

| Package | Purpose |
|---|---|
| express 4.21 | HTTP framework |
| prisma 5.22 | ORM and migrations |
| jsonwebtoken 9.0 | JWT auth |
| bcryptjs 2.4 | Password hashing |
| zod 3.24 | Request validation |
| cheerio 1.0 | HTML scraping (URL metadata) |
| express-rate-limit | Auth endpoint rate limiting |
| nanoid | Share token generation |
| axios | OpenRouter AI API calls |

---

## Core Features

### Authentication
- Email/password registration and login
- JWT Bearer tokens (30-day expiry, stored in AsyncStorage)
- Rate limiting: 20 requests / 15 min on auth routes
- Auto-logout on 401

### Wishlists & Items
- Create wishlists with occasion type and visibility
- Add items with title, price, URL, image, and priority level
- Paste any URL to auto-fill item details (via Cheerio scraping)
- Item lifecycle: `AVAILABLE → RESERVED → COLLECTING → COLLECTED`

### Sharing & Guest Access
- Each wishlist has a unique share token
- Deep link: `wishlist://share/{token}` opens guest view
- Guests can reserve items or contribute money without an account

### Social
- Send/accept/decline friend requests
- Visibility system: FRIENDS-only wishlists visible only to mutual friends
- Activity feed showing friends' recent wishlist items

### Wallet & Coins
- New users receive a signup coin bonus
- Coins can be donated to any item on any wishlist
- Full transaction history (sent, received, donated, refunded)

### Groups
- Create a group, share its join code
- Members add collective gift items with a coin target
- All members can donate coins toward group items

### AI Gift Advisor
- OpenRouter API integration
- Suggests gift ideas based on user-provided context
- Accessible from the item creation flow

---

## Environment Variables

**Backend** (`backend/.env`):

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/wishlist"
JWT_SECRET="your-super-secret-jwt-key-change-this"
PORT=3000
OPENROUTER_API_KEY="sk-or-v1-..."
```

---

## Setup

See [SETUP.md](SETUP.md) for full developer setup instructions (prerequisites, database setup, iOS simulator).

**Quick start:**

```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npm run dev          # → http://localhost:3000

# iOS app
cd WishlistApp
npm install
cd ios && pod install && cd ..
npx react-native start
npx react-native run-ios
```

---

## Scripts

**Backend (`backend/package.json`)**

| Script | Action |
|---|---|
| `npm run dev` | Start dev server with ts-node |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled build |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:studio` | Open Prisma Studio |

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development server
ng serve

# Production build
ng build

# Lint
npm run lint
npm run lint:fix

# Format with Prettier
npm run format

# Tests
ng test
```

## Architecture Overview

This is an Angular 20 real estate catalog application (`sheltos-front`) with Firebase backend.

### Routing

All routes are lazy-loaded via `loadChildren()`. The root layout wraps all routes, with major sections: home, listing (grid/list/tab views), property details, pages (auth, agency, user panel), agents, and contact. Fallback redirects to a 404 page.

### Firebase Services (`src/app/shared/services/firebase/`)

Four dedicated services wrap Firebase SDK:
- **firebase-auth.service.ts** — Email/password and Google OAuth; exposes `user$: Observable<User | null>`
- **firebase-database.service.ts** — Realtime Database for user profiles (`UserData` interface with name, email, phone, role, address fields, timestamps)
- **firebase-firestore.service.ts** — Firestore for general document storage with generic `getCollection<T>`, `getDocument<T>`, etc.
- **firebase-storage.service.ts** — File uploads with resumable upload support and progress tracking

### State Management (NGXS)

Store is configured in `app.config.ts` with five states: `WishlistState`, `CategoryState`, `CompareState`, `ImageState`, `PropertyState`. Wishlist and compare states are persisted to localStorage via `withNgxsStoragePlugin`.

`CategoryState` handles property filtering by tags, price range, area range, and sort order. It integrates with `PropertyService` for data.

### Property Data

`PropertyService` (`src/app/shared/services/property.service.ts`) loads static JSON from `assets/data/`. It provides listings, pagination (6 items/page), filtering, and currency handling (stored in localStorage with symbol/rate).

### Auth Flow

1. User registers/logs in via `LoginForm` or `SignUpForm` components (`src/app/components/pages/other-pages/widgets/`)
2. `FirebaseAuthService` authenticates with Firebase
3. On first login, user data is written to Realtime Database with role `CLIENTE`
4. Last login timestamp is updated on each login

### User Roles

`RoleEnum` is defined in `src/app/shared/model/role-enum.ts`. Currently only `CLIENTE` exists but the system is structured for multiple roles.

### Key Libraries

- **UI**: Bootstrap 5.3.2, ng-bootstrap
- **Maps**: Leaflet + ngx-leaflet
- **Charts**: ApexCharts + Chartist
- **State**: NGXS
- **i18n**: @ngx-translate/core with HTTP loader
- **Toasts**: ngx-toastr, SweetAlert2

### Environments

`src/environments/` has `environment.ts` (dev) and `environment.prod.ts` (prod). Both point to the same Firebase project (`fed-catalogo-arquitetura`). The build replaces the dev file automatically.

### Code Style

ESLint (Angular ESLint v20 + Prettier integration) is configured. `strictPropertyInitialization: false` is set in tsconfig to accommodate Angular DI patterns.

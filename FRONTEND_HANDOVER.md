# Frontend Handover

## Overview

Frontend app lives in `frontend`.

It is a Next.js App Router application used for:

- login and session-based access
- role-based dashboard navigation
- sale creation and sale detail views
- incentive listing, review workflow, and detail pages
- finance payment queue and payment detail page
- admin user/rule management
- reports and dashboard charts

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack React Query
- React Hook Form + Zod

## Useful Commands

Run from `frontend`:

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
```

## Environment Variables

Copy from `frontend/.env.example`.

Variables:

- `NEXT_PUBLIC_API_URL`: browser-side API base, for client components
- `API_URL`: server-side API base, for middleware and server components

Typical local value:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
API_URL=http://localhost:5000/api/v1
```

## App Structure

Main routing is under `app/`.

Public pages:

- `/login`
- `/maintenance`

Protected areas:

- `/dashboard`
- `/sales`
- `/sales/new`
- `/sales/[id]`
- `/incentives/my`
- `/incentives/review`
- `/incentives/[id]`
- `/reports`
- `/payments`
- `/payments/[id]`
- `/admin`
- `/admin/users`
- `/admin/rules`
- `/profile`

Important layout files:

- `app/layout.tsx`: root layout and providers
- `app/(dashboard)/layout.tsx`: sidebar + topbar shell for authenticated pages

## Folder Map

- `app`: route segments, pages, loading states, error boundaries
- `features`: feature-specific UI and form logic
- `components/ui`: reusable UI primitives
- `components/layout`: sidebar, topbar, nav shell
- `services`: API wrappers for browser/server usage
- `providers`: React Query and toast providers
- `lib`: helpers for session, formatting, RBAC, exports, route config
- `types/api.types.ts`: frontend API-facing types

## Request/Data Flow

### Browser-side requests

Main file:

- `services/api-client.ts`

Used by client components and React Query mutations/queries. It:

- reads `NEXT_PUBLIC_API_URL`
- sends cookies with `credentials: "include"`
- normalizes API error responses into `ApiError`

### Server-side requests

Main file:

- `services/api-client.server.ts`

Used by server components. It:

- reads cookies from `next/headers`
- forwards them to backend requests
- disables caching with `cache: "no-store"`

### Session lookup

Main file:

- `lib/getSession.ts`

This fetches `/auth/me` from the backend and returns either:

- authenticated user session object
- `null` when user is not authenticated or backend check fails

## Route Protection

Main file:

- `proxy.ts`

This is the frontend auth/RBAC gate.

What it does:

- allows public access to `/login` and `/maintenance`
- calls backend `/auth/me` using incoming cookies
- redirects unauthenticated users to `/login`
- redirects backend failures/timeouts to `/maintenance`
- enforces role-based route access using `lib/rbacRoutes.ts`
- redirects `/` to the default role home page

Role-to-route rules are centralized in:

- `lib/rbacRoutes.ts`
- `lib/navigation.ts`

## Providers

`providers/AppProviders.tsx` wraps the app with:

- `ReactQueryProvider`
- `ToastProvider`

This means query state and toast notifications are available across the app.

## Feature Breakdown

### Auth

Main files:

- `app/login/page.tsx`
- `features/auth/LoginForm.tsx`
- `services/auth.api.ts`

Behavior:

- form validation uses Zod + React Hook Form
- submit uses React Query mutation
- successful login redirects to `/dashboard`

### Dashboard

Main files:

- `app/(dashboard)/dashboard/page.tsx`
- `features/dashboard/DashboardStats.tsx`
- `features/dashboard/IncentiveCharts.tsx`
- `services/reports.server.ts`

Shows summary stats and charted incentive information for the logged-in user.

### Sales

Main files:

- `app/(dashboard)/sales/page.tsx`
- `app/(dashboard)/sales/new/page.tsx`
- `app/(dashboard)/sales/[id]/page.tsx`
- `features/sales/SaleForm.tsx`
- `features/sales/VoidSaleButton.tsx`
- `services/sales.api.ts`
- `services/sales.server.ts`

Behavior:

- new sale form is client-side validated with Zod
- create action uses React Query mutation
- success redirects to `/incentives/my`
- sale detail page shows linked incentives
- finance role can void a sale

### Incentives

Main files:

- `app/(dashboard)/incentives/my/page.tsx`
- `app/(dashboard)/incentives/review/page.tsx`
- `app/(dashboard)/incentives/[id]/page.tsx`
- `features/incentives/*`
- `services/incentives.api.ts`
- `services/incentives.server.ts`

Feature components include:

- filters table
- event timeline
- claim modal
- approve modal
- hold modal
- action panel
- breakdown and notes

### Payments

Main files:

- `app/(dashboard)/payments/page.tsx`
- `app/(dashboard)/payments/[id]/page.tsx`
- `features/payment/PayButton.tsx`
- `services/payments.api.ts`
- `services/payment.server.ts`

Used by `OWNER_FINANCE` role to:

- view claim-requested incentives
- open payment detail
- mark an incentive as paid

### Reports

Main files:

- `app/(dashboard)/reports/page.tsx`
- `features/reports/ReportTable.tsx`
- `features/reports/ExportCSV.tsx`
- `features/reports/ExportWrapper.tsx`
- `services/reports.api.ts`
- `services/reports.server.ts`

This area displays paginated report data and supports export helpers.

### Admin

Main files:

- `app/(dashboard)/admin/page.tsx`
- `app/(dashboard)/admin/users/page.tsx`
- `app/(dashboard)/admin/rules/page.tsx`
- `features/admin/*`
- `services/admin.api.ts`

Admin area covers:

- creating users
- editing users
- updating managers
- deleting users
- creating rules
- viewing rule tables

## UI Patterns

Common reusable UI lives in `components/ui`, including:

- table
- pagination
- empty state
- status badge
- stat card
- skeleton loaders

These are shared across dashboard, reports, sales, incentives, and payments.

## Error Handling

Current error-related files:

- `app/global-error.tsx`
- `app/not-found.tsx`
- `app/(dashboard)/error.tsx`
- `services/api-error.ts`
- `lib/getErrorMessage.ts`
- `lib/getApiErrorMeta.ts`

Pattern used in forms/actions:

- backend errors are converted to `ApiError`
- field-level validation issues are mapped back into form errors
- user-facing feedback is usually shown through toast notifications

## Important Handover Notes

### Auth depends on cookies

The frontend does not store tokens itself. Authentication depends on the backend setting the `auth_token` cookie correctly for the current deployment domain.

### Two API env vars are required

- `NEXT_PUBLIC_API_URL` is used in browser code
- `API_URL` is used in middleware and server-side code

If one is wrong, the app may partially work and partially fail.

### Maintenance fallback

If the backend is unreachable during route protection, users are redirected to `/maintenance`.

### RBAC is centralized

When adding a new protected page, update:

- `lib/rbacRoutes.ts`
- `proxy.ts` matcher if needed
- sidebar/navigation expectations

## Suggested First Checks For New Maintainer

1. Confirm frontend env values point to the correct backend base URL.
2. Test login/logout with the real deployment domain.
3. Verify each role lands on the correct default page and can only access allowed routes.
4. Test one end-to-end flow each for sale creation, incentive review, claim, and payment.
5. Check loading/error states on pages that depend on backend availability.


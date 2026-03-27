# Backend Handover

## Overview

Backend app lives in `backend`.

It is a TypeScript Express API with Prisma + PostgreSQL. The backend is responsible for:

- authentication via JWT stored in an `auth_token` cookie
- user and reporting hierarchy management
- sale creation and sale listing
- automatic incentive generation when a sale is created
- incentive review, claim, hold, reopen, and payment actions
- dashboard stats and reports
- email notifications for review / claim / payment lifecycle events

Base API prefix: `/api/v1`

Main route groups:

- `/api/v1/auth`
- `/api/v1/admin`
- `/api/v1/sales`
- `/api/v1/incentives`
- `/api/v1/reports`

Health endpoints:

- `/`
- `/health`
- `/health/ui`

## Stack

- Node.js
- Express 5
- TypeScript
- Prisma 7
- PostgreSQL
- Zod validation
- JWT + bcrypt
- Brevo email API

## Useful Commands

Run from `backend`:

```bash
npm install
npm run dev
npm run build
npm run start
npm run db:generate
npm run db:migrate
npm run db:deploy
npm run db:seed
npm run db:studio
npm run email:test
```

## Environment Variables

Copy from `backend/.env.example`.

Required / important values:

- `PORT`
- `NODE_ENV`
- `CORS_ORIGINS`
- `DATABASE_URL`
- `JWT_SECRET`
- `APP_BASE_URL`
- `BREVO_API_KEY`
- `EMAIL_FROM`
- `EMAIL_FROM_NAME`
- `BREVO_SANDBOX`

Seed-only values:

- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## Startup Flow

Entry point:

- `src/index.ts` loads env and starts the Express server.

App setup:

- `src/app.ts` configures CORS, JSON parsing, cookie parsing, routes, and error handlers.

Important middleware:

- `src/middleware/auth.middleware.ts`: reads `auth_token` cookie and attaches `req.user`
- `src/middleware/rbac.middleware.ts`: blocks access by role
- `src/middleware/error.middleware.ts`: handles unknown routes and server errors

## Folder Map

- `src/routes`: Express route definitions
- `src/controllers`: thin HTTP layer
- `src/services`: business logic
- `src/lib`: Prisma client, auth helpers, email, incentive engine
- `src/middleware`: auth / RBAC / error handling
- `src/utils`: errors, pagination, hierarchy helpers
- `src/validations`: Zod request schemas
- `prisma/schema.prisma`: DB schema
- `prisma/migrations`: DB migration history
- `prisma/seed.ts`: initial data seeding
- `src/generated/prisma`: generated Prisma client output

## Database Model Summary

Main tables:

- `User`: employees, admins, finance, managers, hierarchy via `managerId`
- `Sale`: one sale created by a salesperson
- `IncentiveRule`: active percentage rule for each level `L1` to `L4`
- `Incentive`: generated payout record per level for a sale
- `IncentiveEvent`: audit trail for status changes
- `ValuationSnapshot`: valuation history per sale
- `EmployeeKPI`: optional KPI metrics by month (not used currently)

Main enums:

- `UserRole`: `SALES`, `TEAM_LEAD`, `MANAGER`, `OWNER_FINANCE`, `ADMIN`
- `IncentiveStatus`: `PENDING_REVIEW`, `ON_HOLD`, `CLAIMABLE`, `CLAIM_REQUESTED`, `PAID`
- `IncentiveLevel`: `L1`, `L2`, `L3`, `L4`

## Business Flow

### 1. Login

- `POST /api/v1/auth/login`
- validates email/password
- checks user active status
- returns success and writes `auth_token` cookie

Session lookup:

- `GET /api/v1/auth/me`

Logout:

- `POST /api/v1/auth/logout`

### 2. Sale Creation

Primary files:

- `src/controllers/sale.controller.ts`
- `src/services/sale.service.ts`
- `src/lib/incentive.engine.ts`

Flow:

1. Sales user submits sale.
2. Backend validates payload with Zod.
3. Backend ensures the salesperson has a manager assigned.
4. Sale is inserted inside a DB transaction.
5. `generateIncentivesForSale()` creates incentive rows for the manager chain.
6. Initial `IncentiveEvent` rows are created.
7. Reviewer notification email is sent as best-effort background work.

Important behavior:

- duplicate `saleCode` is blocked
- if a sales user has no manager, sale creation fails with `MANAGER_NOT_ASSIGNED`
- incentives are generated only once per sale

### 3. Incentive Generation

Implemented in `src/lib/incentive.engine.ts`.

Current logic:

- reads the sale creator and walks up the manager chain
- maps chain positions to levels `L1` to `L4`
- requires an active rule for every level
- calculates `baseAmount` and `finalAmount` from rule percentage
- creates one incentive per eligible level
- assigns the next level in the chain as reviewer
- for `L4`, self-review is used as fallback if there is no higher reviewer

### 4. Review / Claim / Payment Lifecycle

Main route file:

- `src/routes/incentive.routes.ts`

Common actions:

- `GET /my`
- `GET /review`
- `GET /payments`
- `GET /payments/:id`
- `GET /:id`
- `POST /:id/approve`
- `POST /:id/hold`
- `POST /:id/reopen`
- `POST /:id/claim`
- `POST /:id/pay`

Service split:

- `src/services/incentive.service.ts`: review and beneficiary-side actions
- `src/services/finance.service.ts`: finance payment queue and payment detail
- `src/services/incentive/actions/*`: action-specific logic
- `src/services/incentive/readers/*`: detailed read/query helpers

### 5. Reports

Main files:

- `src/routes/report.routes.ts`
- `src/controllers/report.controller.ts`
- `src/services/report.service.ts`

Endpoints:

- `GET /api/v1/reports/incentives`
- `GET /api/v1/reports/dashboard/stats`

Current report behavior:

- report data is currently scoped to the logged-in beneficiary user
- dashboard stats aggregate the current user's incentives

### 6. Admin

Main files:

- `src/routes/admin.routes.ts`
- `src/controllers/admin.controller.ts`
- `src/services/user.service.ts`
- `src/services/rule.service.ts`

Capabilities:

- create/update/delete users
- update reporting manager
- create incentive rules
- list active and historical rules

## Access Rules

High-level visibility rules in current implementation:

- `SALES`: own sales and own incentives
- `TEAM_LEAD` / `MANAGER`: downline sales plus review queue access
- `OWNER_FINANCE`: org-wide sales visibility, finance queue, mark paid, void sale
- `ADMIN`: user/rule administration and broad sales visibility

## Important Implementation Notes

### Cookie Domain

`src/routes/auth.routes.ts` currently sets and clears the auth cookie using:

- `domain: ".tomatoweb.site"`

If deployment domain changes, this must be updated or moved to an environment variable.

### CORS

Allowed origins are read from `CORS_ORIGINS` as a comma-separated list.

### Email Sending

Email logic is in:

- `src/lib/email.ts`
- `src/services/notification.service.ts`

Behavior:

- email failures do not block the main business transaction
- if Brevo config is missing, email sending is skipped with a warning
- `APP_BASE_URL` is used to build links inside emails

### BigInt Serialization

`src/app.ts` patches `BigInt.prototype.toJSON` so API responses can be serialized.

Several services still convert money values to strings before returning them. Keep that in mind when updating frontend types.

## Known Handover Notes

- There is no automated test suite in this repo yet.
- Prisma client output is committed under `src/generated/prisma`.
- Report logic is currently user-centric rather than org-wide.
- Sale voiding moves unpaid incentives to `ON_HOLD` and creates audit events.
- Frontend session checks depend on backend cookie behavior, so auth-domain changes affect both apps.

## Suggested First Checks For New Maintainer

1. Verify `.env` values for DB, JWT, CORS, cookie domain, and Brevo.
2. Run migrations and seed on the target database.
3. Confirm active incentive rules exist for all four levels.
4. Test login, create sale, approve, claim, and mark paid end-to-end.
5. Verify email links open the correct frontend environment.

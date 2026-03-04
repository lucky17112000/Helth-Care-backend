# PH Healthcare — Backend API

A production-ready RESTful backend for a healthcare platform built with **Node.js**, **TypeScript**, **Express**, **PostgreSQL**, and **Prisma ORM**. It supports patient registration, doctor management, admin control, appointment scheduling, medical records, and secure authentication.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [Database & Prisma](#database--prisma)
- [Modules Overview](#modules-overview)
- [Middleware](#middleware)
- [Scripts](#scripts)
- [Notes & Conventions](#notes--conventions)

---

## Tech Stack

| Layer      | Technology                                       |
| ---------- | ------------------------------------------------ |
| Runtime    | Node.js                                          |
| Language   | TypeScript                                       |
| Framework  | Express.js                                       |
| Database   | PostgreSQL                                       |
| ORM        | Prisma (multi-file schema)                       |
| Auth       | better-auth + custom JWT (access/refresh tokens) |
| Validation | Zod                                              |
| Linting    | ESLint + typescript-eslint                       |

---

## Getting Started

### 1. Initialize Project

```bash
npm init            # creates package.json
tsc --init          # creates tsconfig.json
```

### 2. Install Dependencies

```bash
# Production dependencies
npm install express dotenv http-status cookie-parser jsonwebtoken pg zod @prisma/client better-auth @prisma/adapter-pg

# Development dependencies
npm install -D typescript tsx eslint @eslint/js typescript-eslint @types/node @types/express @types/jsonwebtoken @types/cookie-parser @types/pg prisma
```

### 3. Configure Environment

Create a `.env` file in the project root (see [Environment Variables](#environment-variables)).

### 4. Prisma Setup

```bash
npx prisma generate          # generate Prisma client
npx prisma migrate dev       # run migrations (development)
```

### 5. Run the Server

```bash
npm run dev     # development (tsx watch)
npm run build   # compile TypeScript
npm run start   # production
```

---

## Environment Variables

All variables are validated at startup via `src/config/env.ts`. Missing variables will throw an error.

| Variable                                | Description                               |
| --------------------------------------- | ----------------------------------------- |
| `NODE_ENV`                              | `development` or `production`             |
| `PORT`                                  | Server port (e.g. `5000`)                 |
| `DATABASE_URL`                          | PostgreSQL connection string              |
| `BETTER_AUTH_SECRET`                    | Secret for better-auth session management |
| `BETTER_AUTH_URL`                       | Base URL for better-auth                  |
| `ACCESS_TOKEN_SECRET`                   | JWT secret for access tokens              |
| `REFRESH_TOKEN_SECRET`                  | JWT secret for refresh tokens             |
| `ACCESS_TOKEN_EXPIRES_IN`               | Access token expiry (e.g. `15m`)          |
| `REFRESH_TOKEN_EXPIRES_IN`              | Refresh token expiry (e.g. `7d`)          |
| `BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN`  | Session token expiry duration             |
| `BETTER_AUTH_SESSION__TOKEN_UPDATE_AGE` | Session token update age threshold        |

---

## Project Structure

```
src/
├── app.ts                        # Express app setup
├── server.ts                     # HTTP server entry point
├── config/
│   └── env.ts                    # Environment variable loader & validator
└── app/
    ├── interfaces/               # Shared TypeScript interfaces
    │   ├── error.intefaces.ts
    │   ├── index.d.ts
    │   └── requestUser.interface.ts
    ├── lib/
    │   ├── auth.ts               # better-auth instance configuration
    │   └── prisma.ts             # Prisma client singleton
    ├── middlware/
    │   ├── AppError.ts           # Custom operational error class
    │   ├── cheakAuth.ts          # Role-based auth middleware
    │   ├── globalErrorHandler.ts # Global Express error handler
    │   ├── notFound.ts           # 404 handler
    │   └── validateRequest.ts    # Zod request body validator
    ├── modules/
    │   ├── auth/                 # Auth (register, login)
    │   ├── user/                 # User creation (doctor, admin)
    │   ├── admin/                # Admin CRUD
    │   ├── doctor/               # Doctor CRUD
    │   └── speciality/           # Medical speciality CRUD
    ├── routes/
    │   └── index.ts              # Centralized route registration
    ├── shared/
    │   ├── catchAsync.ts         # Async error wrapper
    │   └── sendReponse.ts        # Standardized JSON response helper
    └── utiles/
        ├── cookie.ts             # Cookie helper functions
        ├── jwt.ts                # JWT sign/verify utilities
        └── token.ts              # Token generation helpers

prisma/
├── config.ts                     # Prisma multi-schema config
├── migrations/                   # Auto-generated SQL migrations
└── schema/
    ├── schema.prisma             # Root datasource & generator config
    ├── enum.prisma               # All enum definitions
    ├── auth.prisma               # User, Session, Account, Verification
    ├── admin.prisma              # Admin model
    ├── doctor.prisma             # Doctor model & DoctorSpecialty
    ├── patient.prisma            # Patient model
    ├── speciality.prisma         # Specialty model
    ├── schedule.prisma           # Schedule & DoctorSchedules
    ├── appoinment.prisma         # Appointment model
    ├── payment.prisma            # Payment model
    ├── prescription.prisma       # Prescription model
    ├── medicalReport.prisma      # MedicalReport model
    ├── patienHelthData.prisma    # PatientHealthData model
    └── review.prisma             # Review model
```

---

## API Endpoints

All routes are prefixed with `/api` (or the configured base path).

### Auth — `/auth`

| Method | Route       | Description              | Auth Required |
| ------ | ----------- | ------------------------ | ------------- |
| POST   | `/register` | Register a new patient   | No            |
| POST   | `/login`    | Login and receive tokens | No            |

### Users — `/users`

| Method | Route            | Description         | Auth Required    |
| ------ | ---------------- | ------------------- | ---------------- |
| POST   | `/create-doctor` | Create a new doctor | Yes (Admin)      |
| POST   | `/create-admin`  | Create a new admin  | Yes (SuperAdmin) |

### Admins — `/admin`

| Method | Route  | Description        | Auth Required |
| ------ | ------ | ------------------ | ------------- |
| GET    | `/`    | Get all admins     | Yes           |
| GET    | `/:id` | Get admin by ID    | Yes           |
| PATCH  | `/:id` | Update admin by ID | Yes           |
| DELETE | `/:id` | Delete admin by ID | Yes           |

### Doctors — `/doctors`

| Method | Route  | Description         | Auth Required |
| ------ | ------ | ------------------- | ------------- |
| GET    | `/`    | Get all doctors     | No            |
| GET    | `/:id` | Get doctor by ID    | No            |
| PATCH  | `/:id` | Update doctor by ID | Yes           |

### Specialities — `/specialities`

| Method | Route  | Description               | Auth Required |
| ------ | ------ | ------------------------- | ------------- |
| POST   | `/`    | Create a speciality       | No            |
| GET    | `/`    | Get all specialities      | Yes (Patient) |
| DELETE | `/:id` | Delete a speciality by ID | No            |

---

## Authentication & Authorization

This project uses a **dual-token** strategy:

| Token             | Purpose                                    | Storage          |
| ----------------- | ------------------------------------------ | ---------------- |
| **Session Token** | Managed by `better-auth`; confirms login   | HTTP-only cookie |
| **Access Token**  | Short-lived JWT with role/email payload    | HTTP-only cookie |
| **Refresh Token** | Long-lived JWT; used to renew access token | HTTP-only cookie |

### Flow

1. User logs in → server issues **access token** + **refresh token** (stored in cookies).
2. Protected routes call `checkAuth(...roles)` middleware.
3. Middleware verifies the access token and checks the user's role.
4. On expiry, client hits a refresh endpoint to get a new access token.

### Role-Based Access Control

Roles are defined in the Prisma `enum.prisma`:

```
SUPER_ADMIN | ADMIN | DOCTOR | PATIENT
```

Use `checkAuth(Role.ADMIN, Role.SUPER_ADMIN)` to protect routes for specific roles.

---

## Database & Prisma

- **Multi-file schema**: Each domain has its own `.prisma` file under `prisma/schema/`.
- **Config file**: `prisma.config.ts` points Prisma to the schema folder.
- **Generated client**: Output goes to `src/generated/prisma/`.
- **Adapter**: Uses `@prisma/adapter-pg` for native PostgreSQL driver support.

### Common Prisma Commands

```bash
npx prisma generate              # Regenerate client after schema changes
npx prisma migrate dev           # Create and apply a new migration
npx prisma migrate dev --name <name>  # Named migration
npx prisma studio                # Open Prisma Studio (GUI)
npx prisma db push               # Push schema without migration (prototyping)
```

---

## Modules Overview

| Module       | Responsibility                                                |
| ------------ | ------------------------------------------------------------- |
| `auth`       | Patient registration, login, token issuance                   |
| `user`       | Creates doctors and admins (privileged operations)            |
| `admin`      | Full CRUD for admin accounts                                  |
| `doctor`     | Full CRUD for doctor profiles, linked to specialities         |
| `speciality` | Manage medical specialities; linked to doctors via join table |

Each module follows the pattern:

```
<module>.route.ts       → Express router
<module>.controller.ts  → Request handlers (calls service)
<module>.service.ts     → Business logic (calls Prisma)
<module>.validation.ts  → Zod schemas for request validation
<module>.interface.ts   → TypeScript types/interfaces
```

---

## Middleware

| File                    | Purpose                                                    |
| ----------------------- | ---------------------------------------------------------- |
| `AppError.ts`           | Custom error class (`AppError(message, statusCode)`)       |
| `cheakAuth.ts`          | `checkAuth(...roles)` — validates JWT and enforces RBAC    |
| `globalErrorHandler.ts` | Catches all errors; sends structured error responses       |
| `notFound.ts`           | Returns `404` for unregistered routes                      |
| `validateRequest.ts`    | Wraps Zod schemas to validate `req.body` before controller |

---

## Scripts

```bash
npm run dev      # Start dev server with tsx (hot reload)
npm run build    # Compile TypeScript to dist/
npm run start    # Run compiled production build
npm run lint     # Run ESLint across the project
```

---

## Notes & Conventions

- **`catchAsync`**: Wraps all async controller functions to forward errors to the global error handler automatically.
- **`sendResponse`**: Standardizes all API responses with `{ success, statusCode, message, data }` shape.
- **Cookie utilities**: Cookie options (httpOnly, secure, sameSite) are centralized in `src/app/utiles/cookie.ts`.
- **JWT utilities**: Sign and verify logic is in `src/app/utiles/jwt.ts`, keeping controllers clean.
- **Zod validation**: Every mutative endpoint uses `validateRequest(schema)` middleware before the controller.
- **Error format**: All errors flow through `globalErrorHandler.ts` and return a consistent JSON structure.
- **Prisma singleton**: `src/app/lib/prisma.ts` exports a single `prisma` instance to avoid connection pool exhaustion.

---

## QueryBuilder — Advanced Filtering, Searching & Pagination

The `QueryBuilder` class lives at `src/app/utiles/QueryBuilder.ts`. It is a generic, chainable utility that wraps Prisma's `findMany` + `count` to give every endpoint powerful query capabilities via URL query parameters — no extra code needed per module.

### How it Works Internally

```
new QueryBuilder(prismaModel, req.query, config)
  .search()          // OR search across searchableFields
  .filter()          // AND filter on filterableFields
  .include(...)      // static relations to always include
  .dynamicInclude(doctorIncludeConfig)  // user-requested relations via ?include=
  .paginate()        // ?page & ?limit
  .sort()            // ?sortBy & ?sortOrder
  .fields()          // ?fields — select only specific columns
  .execute()         // runs prisma.findMany + prisma.count together (Promise.all)
```

`execute()` always returns:

```ts
{
  data: T[],
  meta: {
    page: number,
    limit: number,
    total: number,
    totalPages: number,
  }
}
```

---

### Config Object — Defined Per Module

Each module defines two arrays in its `<module>.constant.ts`:

| Config Property    | Purpose                                                                      |
| ------------------ | ---------------------------------------------------------------------------- |
| `searchableFields` | Fields searched with `contains` (case-insensitive) when `searchTerm` is used |
| `filterableFields` | Fields allowed for exact/range filtering via query params                    |

**Doctor module example** (`doctor.constant.ts`):

```ts
export const doctorSearchableFields = [
  "name",
  "email",
  "qualification",
  "designation",
  "currentWorkingPlace",
  "registrationNumber",
  "specialties.specialty.title", // nested relation (3 levels deep)
];

export const doctorFilterableFields = [
  "gender",
  "isDeleted",
  "appointmentFee",
  "experience",
  "specialties.specialtyId",
  "currentWorkingPlace",
  "registrationNumber",
  "qualification",
  "designation",
  "user.role",
  "specialties.specialty.title",
];
```

---

### All Supported Query Parameters

#### 1. `searchTerm` — Full-text Search (OR)

Searches across **all** `searchableFields` using a case-insensitive `contains`. Fields are combined with `OR`.

```
GET /doctors?searchTerm=cardio
GET /doctors?searchTerm=john
GET /doctors?searchTerm=MBBS
```

Internally generates:

```ts
where: {
  OR: [
    { name: { contains: "cardio", mode: "insensitive" } },
    { email: { contains: "cardio", mode: "insensitive" } },
    {
      specialties: {
        specialty: { title: { contains: "cardio", mode: "insensitive" } },
      },
    },
    // ...all other searchableFields
  ];
}
```

> **Important:** `searchTerm` is excluded from the filter step automatically.

---

#### 2. Exact Filter (AND)

Use any field name from `filterableFields` as the key. Only fields in that list are allowed — others are silently ignored.

```
GET /doctors?gender=MALE
GET /doctors?isDeleted=false
GET /doctors?currentWorkingPlace=Dhaka
GET /doctors?qualification=MBBS
GET /doctors?registrationNumber=REG-001
```

**Type auto-conversion:**

- `"true"` / `"false"` → `boolean`
- Numeric strings → `number`
- Arrays → `{ in: [...] }`

---

#### 3. Nested / Relation Filter (dot notation)

Use dot notation matching `filterableFields` entries to filter on related model fields.

**2-level deep (direct relation):**

```
GET /doctors?user.role=DOCTOR
```

Generates: `where: { user: { role: "DOCTOR" } }`

**3-level deep (join table / nested relation):**

```
GET /doctors?specialties.specialty.title=Cardiology
GET /doctors?specialties.specialtyId=<uuid>
```

Generates: `where: { specialties: { some: { specialty: { title: "Cardiology" } } } }`

---

#### 4. Range / Operator Filter

Append Prisma operators in bracket notation. Works on numeric and string fields.

| Operator       | Meaning               | Example                              |
| -------------- | --------------------- | ------------------------------------ |
| `[lt]`         | Less than             | `?appointmentFee[lt]=500`            |
| `[lte]`        | Less than or equal    | `?appointmentFee[lte]=500`           |
| `[gt]`         | Greater than          | `?appointmentFee[gt]=100`            |
| `[gte]`        | Greater than or equal | `?experience[gte]=5`                 |
| `[equals]`     | Exact match           | `?appointmentFee[equals]=300`        |
| `[not]`        | Not equal             | `?gender[not]=FEMALE`                |
| `[contains]`   | String contains       | `?name[contains]=John`               |
| `[startsWith]` | String starts with    | `?name[startsWith]=Dr`               |
| `[endsWith]`   | String ends with      | `?name[endsWith]=Khan`               |
| `[in]`         | In a list of values   | `?gender[in]=MALE&gender[in]=FEMALE` |
| `[notIn]`      | Not in a list         | `?gender[notIn]=FEMALE`              |

```
GET /doctors?appointmentFee[gt]=100&appointmentFee[lt]=800
GET /doctors?experience[gte]=5
GET /doctors?appointmentFee[equals]=300
```

---

#### 5. Pagination

| Param   | Default | Description                |
| ------- | ------- | -------------------------- |
| `page`  | `1`     | Page number (1-based)      |
| `limit` | `10`    | Number of records per page |

```
GET /doctors?page=2&limit=5
```

Response `meta`:

```json
{
  "page": 2,
  "limit": 5,
  "total": 47,
  "totalPages": 10
}
```

---

#### 6. Sorting

| Param       | Default     | Description                              |
| ----------- | ----------- | ---------------------------------------- |
| `sortBy`    | `createdAt` | Field to sort by (supports dot notation) |
| `sortOrder` | `desc`      | `asc` or `desc`                          |

```
GET /doctors?sortBy=appointmentFee&sortOrder=asc
GET /doctors?sortBy=user.name&sortOrder=asc
GET /doctors?sortBy=createdAt&sortOrder=desc
```

---

#### 7. `fields` — Select Specific Fields Only

Returns only the listed fields. When `fields` is used, all `include` directives are automatically dropped (Prisma does not allow `select` and `include` together).

```
GET /doctors?fields=id,name,email,appointmentFee
```

Generates:

```ts
select: { id: true, name: true, email: true, appointmentFee: true }
```

> **Note:** Currently only supports top-level (direct) fields. Nested field selection is not supported yet.

---

#### 8. `include` — Dynamically Include Relations

Requests specific relations defined in `doctorIncludeConfig`. Multiple relations can be comma-separated.

```
GET /doctors?include=appointments
GET /doctors?include=doctorSchedules
GET /doctors?include=reviews,prescriptions
```

Available relations for doctors (`doctorIncludeConfig` in `doctor.constant.ts`):

- `user`
- `specialties` (with nested `specialty`)
- `appointments` (with nested `patient`, `doctor`)
- `doctorSchedules` (with nested `schedule`)
- `prescriptions`
- `reviews`

> **Note:** `user` and `specialties` are always included by default via `.include({ user: true, specialties: true })` in the service.

---

### Full Combined Example

```
GET /doctors?searchTerm=cardio&gender=MALE&appointmentFee[lt]=800&experience[gte]=3&specialties.specialty.title=Cardiology&page=1&limit=5&sortBy=appointmentFee&sortOrder=asc&include=reviews
```

This single request:

1. Searches `cardio` across all searchable fields
2. Filters to `MALE` doctors only
3. Filters `appointmentFee` below 800
4. Filters `experience` >= 3 years
5. Filters by specialty title `Cardiology`
6. Returns page 1, 5 results per page
7. Sorted by `appointmentFee` ascending
8. Also includes the `reviews` relation in the response

---

### Adding QueryBuilder to a New Module

1. Define `searchableFields` and `filterableFields` arrays in `<module>.constant.ts`
2. In the service, instantiate `QueryBuilder` and chain the methods:

```ts
const queryBuilder = new QueryBuilder<
  MyModel,
  Prisma.MyModelWhereInput,
  Prisma.MyModelInclude
>(prisma.myModel, query, {
  searchableFields: mySearchableFields,
  filterableFields: myFilterableFields,
});

const result = await queryBuilder
  .search()
  .filter()
  .include({ relatedModel: true })
  .paginate()
  .sort()
  .fields()
  .execute();

return result;
```

---

## QueryBuilder — Method Chain Breakdown

Every call in the chain builds up an internal Prisma query object. Nothing hits the database until `.execute()` is called.

```ts
const result = await queryBuilder
  .search()
  .filter()
  .paginate()
  .dynamicInclude(scheduleIncludeConfig)
  .sort()
  .fields()
  .execute();
```

---

### Method Reference

#### `.search()`

**Purpose:** Searches across all `searchableFields` using a case-insensitive `contains`. All fields are joined with `OR`.

**Reads from URL:** `?searchTerm=<value>`

**Effect on query:**

```ts
where: {
  OR: [
    { title: { contains: "morning", mode: "insensitive" } },
    {
      specialties: {
        some: {
          specialty: { title: { contains: "morning", mode: "insensitive" } },
        },
      },
    },
    // ...all other searchableFields
  ];
}
```

> If `searchTerm` is not provided, this method does nothing and passes through.

---

#### `.filter()`

**Purpose:** Applies AND filters based on URL query parameters. Only fields listed in `filterableFields` are allowed — others are silently ignored.

**Reads from URL:** Any key not in `["searchTerm", "page", "limit", "sortBy", "sortOrder", "fields", "include"]`

**Effect on query:**

```ts
// URL: ?isBooked=false&appointmentFee[lt]=500&user.role=DOCTOR
where: {
  isBooked: false,
  appointmentFee: { lt: 500 },
  user: { role: "DOCTOR" }
}
```

**Auto type conversion:**

- `"true"` / `"false"` → `boolean`
- Numeric strings → `number`
- Arrays → `{ in: [...] }`
- Bracket operators (`[lt]`, `[gt]`, `[gte]`, etc.) → Prisma range filters

---

#### `.paginate()`

**Purpose:** Calculates `skip` and `take` values from URL params to slice the result set.

**Reads from URL:** `?page=2&limit=5`

**Defaults:** `page = 1`, `limit = 10`

**Effect on query:**

```ts
// page=2, limit=5 → skip = (2-1) * 5 = 5
query: { skip: 5, take: 5 }
```

**Returns in meta:**

```json
{ "page": 2, "limit": 5, "total": 47, "totalPages": 10 }
```

---

#### `.dynamicInclude(includeConfig, defaultInclude?)`

**Purpose:** Includes Prisma relations **on-demand** based on what the client requests in the URL. Unlike `.include()` which always includes everything, `dynamicInclude()` only loads what is explicitly asked for — saving query cost.

**Parameters:**

| Parameter        | Type                      | Description                                              |
| ---------------- | ------------------------- | -------------------------------------------------------- |
| `includeConfig`  | `Record<string, unknown>` | Map of all available relations and their include options |
| `defaultInclude` | `string[]` _(optional)_   | Relations to always include regardless of URL params     |

**Reads from URL:** `?include=doctorSchedules,appointments`

**Effect on query:**

```ts
// scheduleIncludeConfig = {
//   doctorSchedules: { include: { schedule: true } },
//   appointments: { include: { patient: true } },
//   reviews: true,
// }

// URL: ?include=doctorSchedules,appointments
include: {
  doctorSchedules: { include: { schedule: true } },
  appointments: { include: { patient: true } },
  // reviews is NOT included — client didn't ask
}
```

**With defaultInclude:**

```ts
.dynamicInclude(scheduleIncludeConfig, ["doctorSchedules"])

// doctorSchedules is ALWAYS included even if ?include= is absent or omits it
```

> If `.fields()` has already been called (select mode active), `dynamicInclude()` is a no-op — Prisma cannot use `include` and `select` together.

---

#### `.sort()`

**Purpose:** Applies `orderBy` to the query. Supports dot notation for sorting by nested/relation fields.

**Reads from URL:** `?sortBy=<field>&sortOrder=asc|desc`

**Defaults:** `sortBy = "createdAt"`, `sortOrder = "desc"`

**Effect on query:**

```ts
// ?sortBy=appointmentFee&sortOrder=asc
orderBy: {
  appointmentFee: "asc";
}

// ?sortBy=user.name&sortOrder=asc
orderBy: {
  user: {
    name: "asc";
  }
}
```

---

#### `.fields()`

**Purpose:** Enables Prisma `select` mode — only the requested fields are returned in the response. All other fields (and all relations) are stripped.

**Reads from URL:** `?fields=id,name,email,appointmentFee`

**Effect on query:**

```ts
select: { id: true, name: true, email: true, appointmentFee: true }
// include is automatically deleted — Prisma forbids select + include together
```

> **Important:** When `fields` is active, `.include()` and `.dynamicInclude()` calls are both silently skipped. Currently only top-level (non-nested) fields are supported.

---

#### `.execute()`

**Purpose:** Fires the actual database queries. Runs `prisma.findMany()` and `prisma.count()` **in parallel** using `Promise.all`, then returns both the data and pagination metadata.

**Returns:**

```ts
{
  data: T[],              // array of matching records
  meta: {
    page: number,         // current page
    limit: number,        // records per page
    total: number,        // total matching records (ignores pagination)
    totalPages: number,   // Math.ceil(total / limit)
  }
}
```

**Why parallel?**  
Running count and findMany simultaneously is faster than sequentially — both queries are independent of each other.

---

### Visual Flow Summary

```
.search()         →  WHERE OR: [...]          (full-text search)
.filter()         →  WHERE AND: {...}          (exact / range / nested filters)
.paginate()       →  skip + take               (result slicing)
.dynamicInclude() →  include: {...}            (only client-requested relations)
.sort()           →  orderBy: {...}            (sorting direction & field)
.fields()         →  select: {...}             (field projection)
.execute()        →  prisma.findMany + count   (actual DB hit → data + meta)
```

Each method returns `this`, enabling method chaining. Only `.execute()` is `async` and returns a `Promise`.

---

> Built with TypeScript, Express, Prisma, and PostgreSQL — following a modular, maintainable architecture.
> // access token: can be used to access user data and other protected resource
> // refresh token: can be used to generate new access token when access token expires

email sending service->node mailer, ejs
multer ->it work as a middlawre when we send file in that time it work as a parser
file upload-> as a storage we will use cloudinary, multer will upload file in cloudinary and get url and store in database

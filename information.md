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

> Built with TypeScript, Express, Prisma, and PostgreSQL — following a modular, maintainable architecture.
> // access token: can be used to access user data and other protected resource
> // refresh token: can be used to generate new access token when access token expires

email sending service->node mailer, ejs

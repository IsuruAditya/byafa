# Story 1.2: Initialize Backend Scaffold with Express and TypeScript

Status: done

## Story

As a developer,
I want a working Express v5.1 + TypeScript backend with all required dependencies installed,
so that all backend development can begin from a consistent, production-ready base.

## Acceptance Criteria

1. `backend/package.json` includes express, mongoose, cors, dotenv, bcryptjs, jsonwebtoken, stripe, nodemailer, cloudinary, multer, express-validator
2. TypeScript is configured with strict mode enabled
3. `ts-node-dev` is configured for hot reload in development
4. `backend/src/app.ts` sets up Express with CORS, JSON body parser, and `/api/v1/` route prefix
5. `backend/src/server.ts` starts the server locally without errors
6. `backend/src/config/env.ts` validates required environment variables on startup

## Tasks / Subtasks

- [x] Task 1: Verify/update backend dependencies (AC: 1)
  - [x] Confirm all required packages in `backend/package.json`
  - [x] Add missing `@types/nodemailer` and `@types/cors`
  - [x] Update scripts: `dev` (ts-node-dev), `build` (tsc), `start` (node dist/server.js)

- [x] Task 2: Fix TypeScript configuration (AC: 2)
  - [x] Fix `tsconfig.json`: remove `"jsx": "react-jsx"` (wrong for backend), set `"module": "commonjs"`, `"target": "ES2020"`, `"rootDir": "./src"`, `"outDir": "./dist"`
  - [x] Enable strict mode and useful linting options
  - [x] Verify `npx tsc --noEmit` passes with zero errors

- [x] Task 3: Create `backend/src/config/env.ts` (AC: 6)
  - [x] Load dotenv and validate required env vars on startup
  - [x] Export typed `env` object with all config values
  - [x] Process exits with error message if required vars are missing

- [x] Task 4: Create `backend/src/utils/AppError.ts` (AC: 4)
  - [x] Custom error class extending Error with `statusCode` and `isOperational`

- [x] Task 5: Create `backend/src/api/middleware/error.middleware.ts` (AC: 4)
  - [x] Centralized error handler: AppError → structured JSON, unhandled → 500
  - [x] Never expose stack traces in production

- [x] Task 6: Create `backend/src/app.ts` (AC: 4)
  - [x] Express app with helmet, CORS, JSON body parser
  - [x] `GET /api/v1/health` returns `{ success: true, message: "OK" }`
  - [x] Placeholder comments for future routers
  - [x] Error middleware mounted last

- [x] Task 7: Create `backend/src/server.ts` (AC: 5)
  - [x] Imports app and starts listening on configured PORT

- [x] Task 8: Create `.env` and `.env.example` (AC: 6)
  - [x] `.env` with development placeholder values
  - [x] `.env.example` documenting all required variables

## Dev Notes

### TypeScript Configuration — Critical Fix
The existing `tsconfig.json` had several issues for a Node.js backend:
- `"jsx": "react-jsx"` — wrong, this is not a React app
- `"module": "nodenext"` with `"type": "commonjs"` — inconsistent
- No `rootDir`/`outDir` set

Fixed to use `"module": "commonjs"` (matches `"type": "commonjs"` in package.json), `"target": "ES2020"`, proper `rootDir`/`outDir`.

### Architecture Compliance
- All routes prefixed `/api/v1/` per architecture decision
- Standard response shape `{ success, data?, message }` enforced via error middleware
- `AppError` class is the single mechanism for operational errors
- `helmet` added for security headers (was already in dependencies)

### File Structure After This Story
```
backend/
├── .env                    ← development config (gitignored)
├── .env.example            ← template for all env vars
├── package.json            ← updated scripts + @types/nodemailer, @types/cors
├── tsconfig.json           ← fixed for Node.js CommonJS
└── src/
    ├── app.ts              ← Express app setup
    ├── server.ts           ← local dev entry point
    ├── config/
    │   └── env.ts          ← env validation + typed config
    ├── api/
    │   └── middleware/
    │       └── error.middleware.ts
    └── utils/
        └── AppError.ts
```

### References
- [Source: architecture.md#Core Architectural Decisions] — Express v5.1, CommonJS, `/api/v1/` prefix
- [Source: architecture.md#Format Patterns] — `{ success, data, message }` response shape
- [Source: architecture.md#Process Patterns] — AppError, centralized error middleware
- [Source: epics.md#Story 1.2] — Acceptance criteria

## Dev Agent Record

### Agent Model Used

Claude (Kiro)

### Debug Log References

- Fixed `tsconfig.json`: removed `"jsx": "react-jsx"`, changed `"module"` from `"nodenext"` to `"commonjs"`, added `rootDir`/`outDir`
- Added `@types/nodemailer` and `@types/cors` (were missing from devDependencies)
- `npx tsc --noEmit` passes with zero errors

### Completion Notes List

- ✅ All required dependencies present in `backend/package.json`
- ✅ TypeScript strict mode enabled, `npx tsc --noEmit` zero errors
- ✅ `ts-node-dev` configured for hot reload (`npm run dev`)
- ✅ `backend/src/app.ts` — Express + helmet + CORS + JSON body parser + `/api/v1/health` + error middleware
- ✅ `backend/src/server.ts` — starts server on configured PORT
- ✅ `backend/src/config/env.ts` — validates required env vars, process.exit(1) if missing
- ✅ `backend/src/utils/AppError.ts` — custom error class
- ✅ `backend/src/api/middleware/error.middleware.ts` — centralized error handler
- ✅ `.env` and `.env.example` created

### File List

- `backend/tsconfig.json` — updated: fixed for Node.js CommonJS
- `backend/package.json` — updated: scripts, added `@types/nodemailer`, `@types/cors`
- `backend/src/app.ts` — new
- `backend/src/server.ts` — new
- `backend/src/config/env.ts` — new
- `backend/src/utils/AppError.ts` — new
- `backend/src/api/middleware/error.middleware.ts` — new
- `backend/.env` — new (gitignored)
- `backend/.env.example` — new

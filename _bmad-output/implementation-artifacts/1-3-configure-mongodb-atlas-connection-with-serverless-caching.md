# Story 1.3: Configure MongoDB Atlas Connection with Serverless Caching

Status: done

## Story

As a developer,
I want a Mongoose connection that caches across serverless function invocations,
so that cold starts don't create new DB connections on every request.

## Acceptance Criteria

1. Mongoose connects to MongoDB Atlas successfully given a valid `MONGO_URI`
2. The connection is cached at module level and reused on subsequent invocations
3. Connection errors are logged and the process exits with a non-zero code in development
4. `GET /api/v1/health` returns `{ success: true, message: "OK" }` when DB is connected

## Tasks / Subtasks

- [x] Task 1: Create `backend/src/config/db.ts` with cached connection (AC: 1, 2, 3)
  - [x] Module-level `cached` variable holds the Mongoose instance
  - [x] `connectDB()` returns cached connection if available, otherwise connects
  - [x] `bufferCommands: false` and `maxPoolSize: 10` for serverless compatibility
  - [x] Logs success with host, exits process on error

- [x] Task 2: Wire DB connection into `app.ts` health check (AC: 4)
  - [x] Health check calls `connectDB()` and returns 200 on success, 503 on failure

- [x] Task 3: Wire DB connection into `server.ts` startup (AC: 1)
  - [x] `server.ts` calls `connectDB()` before `app.listen()`

## Dev Notes

### Serverless Caching Pattern
The key pattern for Vercel serverless functions: a module-level variable persists across invocations within the same function instance. By caching the Mongoose connection in `cached`, subsequent requests reuse the existing connection instead of opening a new one on every cold start.

```ts
let cached: typeof mongoose | null = null

export async function connectDB() {
  if (cached) return cached
  cached = await mongoose.connect(env.MONGO_URI, { bufferCommands: false })
  return cached
}
```

`bufferCommands: false` is important — it prevents Mongoose from buffering operations when not connected, which would hide connection failures in serverless environments.

### References
- [Source: architecture.md#Data Architecture] — Mongoose connection cached at module level for serverless reuse
- [Source: epics.md#Story 1.3] — Acceptance criteria

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes List
- ✅ `backend/src/config/db.ts` — cached Mongoose connection, `bufferCommands: false`, `maxPoolSize: 10`
- ✅ `backend/src/app.ts` — health check calls `connectDB()`, returns 503 if DB unavailable
- ✅ `backend/src/server.ts` — connects to DB before starting HTTP server
- ✅ `npx tsc --noEmit` zero errors

### File List
- `backend/src/config/db.ts` — new
- `backend/src/app.ts` — updated: imports `connectDB`, health check verifies DB
- `backend/src/server.ts` — updated: calls `connectDB()` before `app.listen()`

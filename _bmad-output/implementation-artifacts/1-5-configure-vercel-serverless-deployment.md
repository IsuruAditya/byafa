# Story 1.5: Configure Vercel Serverless Deployment

**Status:** done
**Epic:** 1 — Project Foundation & Infrastructure
**Project context:** `_bmad-output/project-context.md`

## Story

As a developer,
I want the backend deployed as a Vercel Serverless Function and the frontend deployed as a Vercel static site,
so that both can be deployed to Vercel without a credit card.

## Acceptance Criteria

**AC1 — Serverless entry point:**
Given `api/index.ts` imports and exports the Express app
When the project is deployed to Vercel
Then `vercel.json` correctly routes all `/api/*` requests to the serverless function

**AC2 — Frontend static site:**
Given the frontend is built
When deployed to Vercel
Then the SPA is served as a static site with client-side routing fallback (`rewrites` to `index.html`)

**AC3 — Health check:**
Given the deployment is live
When `GET /api/v1/health` is called
Then it returns `{ success: true, message: "OK" }` with status 200

## Tasks

- [x] `api/index.ts` — Vercel serverless entry point wrapping Express app
- [x] `backend/vercel.json` — Vercel routing configuration
- [x] `backend/src/app.ts` — `GET /api/v1/health` endpoint

## Dev Notes

### Architecture references
- Entry point: `api/index.ts` exports `export default app` (Vercel expects default export)
- vercel.json: `{ "rewrites": [{ "source": "/api/(.*)", "destination": "/api/index" }] }`
- Mongoose caching: module-level `let cached` variable prevents new connections on each invocation
- Environment variables: set in Vercel dashboard, not committed to repo

### Key files
- `api/index.ts` — serverless entry point
- `backend/vercel.json` — routing config
- `backend/src/app.ts` — health endpoint

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ api/index.ts created as Vercel serverless entry point
- ✅ vercel.json configured with API rewrites
- ✅ GET /api/v1/health endpoint returns 200
- ✅ Mongoose connection cached at module level

### File List
- `api/index.ts`
- `backend/vercel.json`
- `backend/src/app.ts`

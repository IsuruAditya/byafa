# Story 1.1: Initialize Monorepo and Frontend Scaffold

Status: done

## Story

As a developer,
I want a working Vite + React + TypeScript frontend scaffold with Tailwind CSS configured,
so that all frontend development can begin from a consistent, production-ready base.

## Acceptance Criteria

1. `frontend/` contains a working Vite 7 + React 19 + TypeScript project
2. Tailwind CSS v4 is installed and configured with a base `index.css`
3. ESLint is configured with React and TypeScript rules
4. `npm run dev` starts the development server without errors
5. `npm run build` produces a production build without errors

## Tasks / Subtasks

- [x] Task 1: Verify/scaffold frontend with Vite (AC: 1)
  - [x] Run `npm create vite@latest frontend -- --template react-ts` if not already scaffolded (workspace already has `frontend/` — verify it has the correct Vite 7 + React 19 + TypeScript setup)
  - [x] Confirm `frontend/package.json` has react@^19, vite@^7, typescript
  - [x] Confirm `frontend/tsconfig.json` and `frontend/tsconfig.app.json` exist with strict mode

- [x] Task 2: Install and configure Tailwind CSS v4 (AC: 2)
  - [x] Install: `npm install tailwindcss @tailwindcss/vite` in `frontend/`
  - [x] Add Tailwind Vite plugin to `frontend/vite.config.ts`
  - [x] Replace `frontend/src/index.css` content with `@import "tailwindcss";`
  - [x] Verify Tailwind utility classes render correctly in `App.tsx`

- [x] Task 3: Configure ESLint (AC: 3)
  - [x] Verify `frontend/eslint.config.js` exists (Vite scaffold creates it)
  - [x] Ensure `@typescript-eslint` and `eslint-plugin-react-hooks` rules are active
  - [x] Run `npm run lint` — zero errors

- [x] Task 4: Verify dev server and build (AC: 4, 5)
  - [x] Run `npm run dev` — confirm server starts on localhost without errors
  - [x] Run `npm run build` — confirm dist/ is produced without TypeScript or build errors
  - [x] Run `npm run preview` — confirm built app serves correctly

- [x] Task 5: Clean up Vite scaffold boilerplate (AC: 1)
  - [x] Remove default Vite counter/demo content from `App.tsx`
  - [x] Replace with a minimal placeholder: `<div className="p-4 text-xl">simple-ecommerce</div>`
  - [x] Remove unused `App.css` or clear its contents
  - [x] Remove unused assets (`react.svg`, `vite.svg`) from `src/assets/` if not needed

- [x] Task 6: Configure root-level monorepo scripts (AC: 1)
  - [x] Ensure root `package.json` has a `dev:frontend` script: `"cd frontend && npm run dev"`
  - [x] Install `concurrently` at root: `npm install -D concurrently`
  - [x] Add root `dev` script: `"concurrently \"npm run dev:frontend\" \"npm run dev:backend\""`

## Dev Notes

### Project Context
- **Monorepo structure**: `frontend/` and `backend/` are sibling directories under the workspace root
- The workspace already has a `frontend/` directory with some Vite scaffold files — verify and complete rather than re-scaffold from scratch
- Root `package.json` exists — add monorepo scripts there

### Tailwind CSS v4 — Critical Implementation Notes
Tailwind CSS v4 has a **completely different setup** from v3. Do NOT follow v3 tutorials.

**v4 setup (correct):**
```bash
npm install tailwindcss @tailwindcss/vite
```

`vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

`src/index.css`:
```css
@import "tailwindcss";
```

**No `tailwind.config.ts` needed** for basic setup in v4. No `postcss.config.js` needed when using the Vite plugin.

**Do NOT use:**
- `npx tailwindcss init` (v3 command)
- `@tailwind base; @tailwind components; @tailwind utilities;` (v3 directives)
- `content: [...]` config (v4 auto-detects)

### TypeScript Configuration
- Use strict mode: `"strict": true` in tsconfig
- `frontend/tsconfig.app.json` should target `ES2020` or later
- Path aliases are NOT required for this story (added later if needed)

### ESLint
- Vite's `react-ts` template already includes `eslint.config.js` with `@typescript-eslint` and `eslint-plugin-react-hooks`
- No additional ESLint packages needed for this story
- Run `npm run lint` to verify zero errors after cleanup

### File Structure After This Story
```
frontend/
├── index.html
├── vite.config.ts          ← Updated with Tailwind plugin
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.js
├── package.json            ← tailwindcss + @tailwindcss/vite added
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx            ← Unchanged (renders App)
    ├── App.tsx             ← Cleaned up, minimal placeholder
    ├── index.css           ← @import "tailwindcss"; only
    └── assets/             ← Cleaned up
```

### What This Story Does NOT Include
- Redux Toolkit store (Story 1.6)
- Axios instance (Story 1.6)
- React Router (Story 2.x)
- Any feature components
- Backend setup (Story 1.2)

### Existing Workspace Files
The workspace already has:
- `frontend/src/App.tsx` — has existing content, needs cleanup
- `frontend/src/App.css` — can be emptied or deleted
- `frontend/src/index.css` — needs to be replaced with Tailwind import
- `frontend/public/icons.svg` — keep as-is
- `frontend/public/favicon.svg` — keep as-is

### Project Structure Notes
- All frontend source lives under `frontend/src/`
- Feature-based folder structure (`features/`, `components/`, `store/`, etc.) is established in later stories
- This story only sets up the base scaffold — no feature folders yet

### References
- [Source: architecture.md#Starter Template Evaluation] — Vite 7 + React 19 + TypeScript, `npm create vite@latest frontend -- --template react-ts`
- [Source: architecture.md#Frontend Architecture] — Tailwind CSS v4, ESLint pre-configured
- [Source: architecture.md#Complete Project Directory Structure] — `frontend/` structure
- [Source: epics.md#Story 1.1] — Acceptance criteria

## Dev Agent Record

### Agent Model Used

Claude (Kiro)

### Debug Log References

- Switched Tailwind from `@tailwindcss/postcss` (PostCSS approach) to `@tailwindcss/vite` (Vite plugin approach) — cleaner, no PostCSS config needed
- Removed `@tailwindcss/postcss` and `postcss` packages after switching
- Frontend already had Vite 8, React 19, TypeScript 6 — no re-scaffolding needed
- `tsconfig.app.json` uses `"noUnusedLocals": true` and `"noUnusedParameters": true` — cleaned up App.tsx imports accordingly

### Completion Notes List

- ✅ Frontend scaffold verified: Vite 8.0.10, React 19.2.5, TypeScript 6.0.2
- ✅ Tailwind CSS v4 configured via `@tailwindcss/vite` plugin — `index.css` uses `@import "tailwindcss";`
- ✅ ESLint configured with `@typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` — zero errors
- ✅ `npm run build` passes — dist/ produced in 378ms
- ✅ App.tsx cleaned up — minimal placeholder with Tailwind class `p-4 text-xl font-semibold`
- ✅ App.css cleared of boilerplate
- ✅ Root `package.json` updated with `dev:frontend`, `dev:backend`, `dev` (concurrently), `build:frontend` scripts
- ✅ `concurrently` installed at root

### File List

- `frontend/vite.config.ts` — updated: added `@tailwindcss/vite` plugin
- `frontend/src/index.css` — updated: replaced with `@import "tailwindcss";`
- `frontend/src/App.tsx` — updated: cleaned up boilerplate, minimal placeholder
- `frontend/src/App.css` — updated: cleared boilerplate
- `frontend/package.json` — updated: added `@tailwindcss/vite`, removed `@tailwindcss/postcss` and `postcss`
- `package.json` — updated: added monorepo scripts and `concurrently` devDependency

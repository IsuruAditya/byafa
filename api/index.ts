/**
 * Vercel Serverless Function entry point.
 *
 * This file is the bridge between Vercel's serverless runtime and the
 * Express application. Vercel routes all /api/* requests here via vercel.json.
 *
 * The Express app is imported from the backend source — Vercel compiles
 * TypeScript automatically when `@vercel/node` is used as the runtime.
 */
import app from '../backend/src/app'
import { connectDB } from '../backend/src/config/db'

// Ensure DB is connected before handling any request.
// connectDB() caches the connection, so this is a no-op on warm invocations.
connectDB().catch((err) => {
  console.error('Failed to connect to database:', err)
})

export default app

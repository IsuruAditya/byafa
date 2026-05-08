# Story 3.1: Product Model and Seed Data

**Status:** done
**Epic:** 3 — Product Catalog & Discovery
**Project context:** `_bmad-output/project-context.md`

## Story

As a developer,
I want a Product Mongoose model with all required fields and indexes,
so that product data can be stored, queried, and retrieved efficiently.

## Acceptance Criteria

**AC1 — Product schema:**
Given the backend is running
When the Product model is defined
Then it includes: `name`, `description`, `price`, `images` (array), `category`, `stockQuantity`, `ratings.average`, `ratings.count`, `createdAt`, `updatedAt`
And `timestamps: true` is set on the schema
And `price` has `min: 0` validation
And `stockQuantity` has `min: 0` validation

**AC2 — Indexes:**
Then MongoDB indexes exist on:
- `{ name: 'text', description: 'text' }` — full-text search
- `{ category: 1 }` — category filter
- `{ price: 1 }` — price sort
- `{ 'ratings.average': -1 }` — popularity sort
- `{ createdAt: -1 }` — newest sort

**AC3 — Seed script:**
Given `npm run seed` is run from `backend/`
Then products are fetched from `dummyjson.com/products?limit=100`
And existing products are cleared before insert
And an admin user `admin@simple-ecommerce.dev` / `Admin1234!` is created
And categories are mapped to: `electronics`, `clothing`, `home`, `sports`, `books`

## Tasks

- [x] `backend/src/models/Product.model.ts` — IProduct interface, schema, indexes
- [x] `backend/src/scripts/seed.ts` — fetch dummyjson, clear, insert, create admin

## Dev Notes

### Category mapping
dummyjson categories → our simplified set via `CATEGORY_MAP` object in seed script.
Unknown categories default to `'home'`.

### Seed script pattern
```ts
import dotenv from 'dotenv'
dotenv.config()
// connectDB() → deleteMany() → insertMany() → User.create() → disconnect()
```
Must call `dotenv.config()` before importing `env.ts`.

### IProduct interface
```ts
export interface IProduct extends Document {
  name: string; description: string; price: number
  images: string[]; category: string; stockQuantity: number
  ratings: { average: number; count: number }
  createdAt: Date; updatedAt: Date
}
```

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ Product model with all fields, indexes, `timestamps: true`
- ✅ Seed script fetches 100 products from dummyjson, maps categories, inserts, creates admin
- ✅ `npm run seed` script in `backend/package.json`

### File List
- `backend/src/models/Product.model.ts`
- `backend/src/scripts/seed.ts`
- `backend/package.json` (seed script)

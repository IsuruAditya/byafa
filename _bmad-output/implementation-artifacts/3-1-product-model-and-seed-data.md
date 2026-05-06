# Story 3.1: Product Model and Seed Data

**Status:** done
**Epic:** 3 — Product Catalog & Discovery
**Project context:** `_bmad-output/project-context.md`

## Story

As a developer,
I want a Product Mongoose model with all required fields and indexes,
so that product data can be stored, queried, and retrieved efficiently.

## Acceptance Criteria

**AC1 — Schema fields:**
Given the Product model is defined
Then it includes: `name`, `description`, `price`, `images` (array), `category`, `stockQuantity`, `ratings` (average + count), `createdAt`, `updatedAt`
And `timestamps: true` is set on the schema

**AC2 — Indexes:**
Given the schema has indexes
Then text index on `name` and `description` for search
Then index on `category` for filtering
Then index on `price` for sorting
Then index on `ratings.average` for popularity sort
Then index on `createdAt` for newest sort

**AC3 — Seed data:**
Given the seed script runs
Then at least 5 products are inserted from dummyjson.com
And products have realistic data (name, description, price, images, category, stockQuantity, ratings)

## Tasks

- [x] `backend/src/models/Product.model.ts` — IProduct interface, schema with all fields
- [x] `backend/src/scripts/seed.ts` — fetches from dummyjson.com, creates products + admin user

## Dev Notes

### Product schema
```ts
{
  name: { type: String, required: true, maxlength: 200 },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  images: { type: [String], default: [] },
  category: { type: String, required: true, lowercase: true },
  stockQuantity: { type: Number, required: true, min: 0, default: 0 },
  ratings: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } }
}
```

### Indexes
```ts
productSchema.index({ name: 'text', description: 'text' }) // full-text search
productSchema.index({ category: 1 })                       // category filter
productSchema.index({ price: 1 })                          // price sort
productSchema.index({ 'ratings.average': -1 })             // popularity sort
productSchema.index({ createdAt: -1 })                     // newest sort
```

### Seed script
- Fetches 100 products from dummyjson.com
- Maps categories (e.g. `smartphones` → `electronics`)
- Creates admin user: `admin@simple-ecommerce.dev` / `Admin1234!`
- Clears existing products and admin before inserting

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ Product model with all required fields and timestamps
- ✅ All 5 indexes created
- ✅ Seed script fetches from dummyjson.com, maps categories, creates admin user
- ✅ `npm run seed` works in development

### File List
- `backend/src/models/Product.model.ts`
- `backend/src/scripts/seed.ts`

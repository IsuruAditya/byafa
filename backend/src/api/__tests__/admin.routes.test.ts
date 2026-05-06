import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import { app, createAuthToken, authedRequest } from '../../test/helpers'
import { Product } from '../../models/Product.model'
import { makeProductInput } from '../../test/factories'

// Mock Cloudinary — admin product creation uploads images
vi.mock('../../services/cloudinary.service', () => ({
  uploadProductImage: vi.fn().mockResolvedValue(
    'https://res.cloudinary.com/test/image/upload/mock.jpg'
  ),
  deleteProductImage: vi.fn().mockResolvedValue(undefined),
}))

const BASE = '/api/v1/admin'

// ── Auth guard ────────────────────────────────────────────────────────────────

describe('Admin route auth guard', () => {
  it('401 — unauthenticated request', async () => {
    const res = await request(app).get(`${BASE}/ping`)
    expect(res.status).toBe(401)
  })

  it('403 — customer role cannot access admin routes', async () => {
    const { token } = await createAuthToken('customer')
    const res = await authedRequest(token).get(`${BASE}/ping`)
    expect(res.status).toBe(403)
  })

  it('200 — admin role can access admin routes', async () => {
    const { token } = await createAuthToken('admin')
    const res = await authedRequest(token).get(`${BASE}/ping`)
    expect(res.status).toBe(200)
  })
})

// ── GET /admin/products ───────────────────────────────────────────────────────

describe('GET /api/v1/admin/products', () => {
  it('200 — returns paginated product list', async () => {
    const { token } = await createAuthToken('admin')
    await Product.insertMany([
      makeProductInput({ name: 'Alpha' }),
      makeProductInput({ name: 'Beta' }),
    ])

    const res = await authedRequest(token).get(`${BASE}/products`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.length).toBeGreaterThanOrEqual(2)
    expect(res.body.pagination).toBeDefined()
  })

  it('200 — search filters by name', async () => {
    const { token } = await createAuthToken('admin')
    await Product.insertMany([
      makeProductInput({ name: 'Unique Widget' }),
      makeProductInput({ name: 'Other Thing' }),
    ])

    const res = await authedRequest(token).get(`${BASE}/products?search=Unique`)

    expect(res.status).toBe(200)
    expect(res.body.data.length).toBeGreaterThanOrEqual(1)
  })
})

// ── POST /admin/products ──────────────────────────────────────────────────────

describe('POST /api/v1/admin/products', () => {
  it('201 — creates a product (no image upload)', async () => {
    const { token } = await createAuthToken('admin')
    const input = makeProductInput()

    const res = await authedRequest(token)
      .post(`${BASE}/products`)
      .field('name', input.name)
      .field('description', input.description)
      .field('price', String(input.price))
      .field('category', input.category)
      .field('stockQuantity', String(input.stockQuantity))

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.name).toBe(input.name)
  })

  it('400 — missing required fields', async () => {
    const { token } = await createAuthToken('admin')

    const res = await authedRequest(token)
      .post(`${BASE}/products`)
      .field('name', 'Only Name')

    expect(res.status).toBe(400)
  })

  it('403 — customer cannot create products', async () => {
    const { token } = await createAuthToken('customer')
    const input = makeProductInput()

    const res = await authedRequest(token)
      .post(`${BASE}/products`)
      .field('name', input.name)
      .field('description', input.description)
      .field('price', String(input.price))
      .field('category', input.category)
      .field('stockQuantity', String(input.stockQuantity))

    expect(res.status).toBe(403)
  })
})

// ── DELETE /admin/products/:id ────────────────────────────────────────────────

describe('DELETE /api/v1/admin/products/:id', () => {
  it('200 — deletes the product', async () => {
    const { token } = await createAuthToken('admin')
    const product = await Product.create(makeProductInput())

    const res = await authedRequest(token).delete(`${BASE}/products/${product._id}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)

    const found = await Product.findById(product._id)
    expect(found).toBeNull()
  })

  it('404 — product not found', async () => {
    const { token } = await createAuthToken('admin')
    const res = await authedRequest(token).delete(
      `${BASE}/products/000000000000000000000000`
    )
    expect(res.status).toBe(404)
  })
})

// ── PATCH /admin/products/:id/inventory ──────────────────────────────────────

describe('PATCH /api/v1/admin/products/:id/inventory', () => {
  it('200 — updates stock quantity', async () => {
    const { token } = await createAuthToken('admin')
    const product = await Product.create(makeProductInput({ stockQuantity: 5 }))

    const res = await authedRequest(token)
      .patch(`${BASE}/products/${product._id}/inventory`)
      .send({ stockQuantity: 20 })

    expect(res.status).toBe(200)
    expect(res.body.data.stockQuantity).toBe(20)
  })

  it('400 — negative stock is rejected', async () => {
    const { token } = await createAuthToken('admin')
    const product = await Product.create(makeProductInput())

    const res = await authedRequest(token)
      .patch(`${BASE}/products/${product._id}/inventory`)
      .send({ stockQuantity: -1 })

    expect(res.status).toBe(400)
  })
})

// ── GET /admin/dashboard ──────────────────────────────────────────────────────

describe('GET /api/v1/admin/dashboard', () => {
  it('200 — returns dashboard stats', async () => {
    const { token } = await createAuthToken('admin')
    const res = await authedRequest(token).get(`${BASE}/dashboard`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toMatchObject({
      todayOrderCount: expect.any(Number),
      todayRevenue: expect.any(Number),
      pendingOrderCount: expect.any(Number),
    })
  })
})

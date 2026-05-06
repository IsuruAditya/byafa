import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../../test/helpers'
import { Product } from '../../models/Product.model'
import { makeProductInput } from '../../test/factories'

const BASE = '/api/v1/products'

async function seedProducts(count = 3) {
  const products = Array.from({ length: count }, (_, i) =>
    makeProductInput({
      name: `Product ${i + 1}`,
      price: (i + 1) * 10,
      category: i % 2 === 0 ? 'electronics' : 'clothing',
      stockQuantity: 10,
    })
  )
  return Product.insertMany(products)
}

// ── GET /products ─────────────────────────────────────────────────────────────

describe('GET /api/v1/products', () => {
  it('200 — returns paginated products', async () => {
    await seedProducts(5)
    const res = await request(app).get(BASE)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.pagination).toMatchObject({
      page: 1,
      total: 5,
    })
  })

  it('200 — empty array when no products exist', async () => {
    const res = await request(app).get(BASE)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(0)
    expect(res.body.pagination.total).toBe(0)
  })

  it('filters by category', async () => {
    await seedProducts(4)
    const res = await request(app).get(`${BASE}?category=electronics`)

    expect(res.status).toBe(200)
    res.body.data.forEach((p: { category: string }) => {
      expect(p.category).toBe('electronics')
    })
  })

  it('respects pageSize and page params', async () => {
    await seedProducts(10)
    const res = await request(app).get(`${BASE}?page=1&pageSize=3`)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(3)
    expect(res.body.pagination.pageSize).toBe(3)
  })

  it('sorts by price_asc', async () => {
    await seedProducts(3)
    const res = await request(app).get(`${BASE}?sortBy=price_asc`)

    expect(res.status).toBe(200)
    const prices: number[] = res.body.data.map((p: { price: number }) => p.price)
    expect(prices).toEqual([...prices].sort((a, b) => a - b))
  })

  it('sorts by price_desc', async () => {
    await seedProducts(3)
    const res = await request(app).get(`${BASE}?sortBy=price_desc`)

    expect(res.status).toBe(200)
    const prices: number[] = res.body.data.map((p: { price: number }) => p.price)
    expect(prices).toEqual([...prices].sort((a, b) => b - a))
  })

  it('400 — invalid sortBy value', async () => {
    const res = await request(app).get(`${BASE}?sortBy=invalid`)
    expect(res.status).toBe(400)
  })

  it('400 — page must be a positive integer', async () => {
    const res = await request(app).get(`${BASE}?page=0`)
    expect(res.status).toBe(400)
  })
})

// ── GET /products/:id ─────────────────────────────────────────────────────────

describe('GET /api/v1/products/:id', () => {
  it('200 — returns the product', async () => {
    const [product] = await seedProducts(1)
    const res = await request(app).get(`${BASE}/${product!._id}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data._id).toBe(product!._id.toString())
    expect(res.body.data.name).toBe(product!.name)
  })

  it('404 — product not found', async () => {
    const res = await request(app).get(`${BASE}/000000000000000000000000`)
    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })

  it('404 — invalid ObjectId format', async () => {
    const res = await request(app).get(`${BASE}/not-an-id`)
    expect(res.status).toBe(404)
  })
})

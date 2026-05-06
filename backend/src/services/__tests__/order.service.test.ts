import { describe, it, expect, vi } from 'vitest'
import {
  createPaymentIntent,
  createOrderFromWebhook,
  getOrdersByUser,
  getOrderById,
  updateOrderStatus,
} from '../order.service'
import { Product } from '../../models/Product.model'
import { Order } from '../../models/Order.model'
import { User } from '../../models/User.model'
import { makeProductInput, makeShippingAddress, makeUserInput } from '../../test/factories'
import mongoose from 'mongoose'

// ── Mock Stripe — never hit the real API in tests ────────────────────────────
vi.mock('../stripe.service', () => ({
  default: {
    paymentIntents: {
      create: vi.fn().mockResolvedValue({
        client_secret: 'pi_test_secret_123',
        id: 'pi_test_123',
      }),
    },
  },
}))

// ── Helpers ──────────────────────────────────────────────────────────────────

async function seedProduct(overrides = {}) {
  return Product.create(makeProductInput(overrides))
}

async function seedUser() {
  return User.create(makeUserInput())
}

const shippingAddress = makeShippingAddress()

// ── createPaymentIntent ──────────────────────────────────────────────────────

describe('createPaymentIntent', () => {
  it('returns a clientSecret when stock is sufficient', async () => {
    const product = await seedProduct({ price: 10.00, stockQuantity: 5 })
    const user = await seedUser()

    const result = await createPaymentIntent({
      userId: user.id as string,
      items: [{ productId: product.id as string, quantity: 2 }],
      shippingAddress,
    })

    expect(result.clientSecret).toBe('pi_test_secret_123')
    expect(result.totalAmount).toBe(20.00)
  })

  it('calculates total from DB prices — not client-supplied values', async () => {
    const product = await seedProduct({ price: 15.50, stockQuantity: 10 })
    const user = await seedUser()

    const result = await createPaymentIntent({
      userId: user.id as string,
      items: [{ productId: product.id as string, quantity: 3 }],
      shippingAddress,
    })

    expect(result.totalAmount).toBeCloseTo(46.50, 2)
  })

  it('throws 409 when stock is insufficient', async () => {
    const product = await seedProduct({ stockQuantity: 1 })
    const user = await seedUser()

    await expect(
      createPaymentIntent({
        userId: user.id as string,
        items: [{ productId: product.id as string, quantity: 5 }],
        shippingAddress,
      })
    ).rejects.toMatchObject({ statusCode: 409 })
  })

  it('throws 404 when a product does not exist', async () => {
    const user = await seedUser()

    await expect(
      createPaymentIntent({
        userId: user.id as string,
        items: [{ productId: new mongoose.Types.ObjectId().toString(), quantity: 1 }],
        shippingAddress,
      })
    ).rejects.toMatchObject({ statusCode: 404 })
  })
})

// ── createOrderFromWebhook ───────────────────────────────────────────────────

describe('createOrderFromWebhook', () => {
  it('creates an order and decrements stock', async () => {
    const product = await seedProduct({ price: 20.00, stockQuantity: 10 })
    const user = await seedUser()
    const paymentIntentId = `pi_test_${Date.now()}`

    const metadata = {
      userId: user.id as string,
      shippingAddress: JSON.stringify(shippingAddress),
      items: JSON.stringify([
        {
          productId: product.id as string,
          name: product.name,
          price: product.price,
          quantity: 3,
          image: '',
        },
      ]),
    }

    const order = await createOrderFromWebhook(paymentIntentId, null, metadata)

    expect(order.stripePaymentIntentId).toBe(paymentIntentId)
    expect(order.status).toBe('processing')
    expect(order.items).toHaveLength(1)

    // Stock should be decremented
    const updatedProduct = await Product.findById(product._id)
    expect(updatedProduct!.stockQuantity).toBe(7) // 10 - 3
  })

  it('is idempotent — duplicate webhook does not create a second order', async () => {
    const product = await seedProduct({ stockQuantity: 10 })
    const user = await seedUser()
    const paymentIntentId = `pi_test_idempotent_${Date.now()}`

    const metadata = {
      userId: user.id as string,
      shippingAddress: JSON.stringify(shippingAddress),
      items: JSON.stringify([
        { productId: product.id as string, name: product.name, price: 10, quantity: 1, image: '' },
      ]),
    }

    const order1 = await createOrderFromWebhook(paymentIntentId, null, metadata)
    const order2 = await createOrderFromWebhook(paymentIntentId, null, metadata)

    expect(order1._id.toString()).toBe(order2._id.toString())

    const count = await Order.countDocuments({ stripePaymentIntentId: paymentIntentId })
    expect(count).toBe(1)
  })

  it('stores the stripeChargeId when provided', async () => {
    const product = await seedProduct({ stockQuantity: 5 })
    const user = await seedUser()
    const paymentIntentId = `pi_test_charge_${Date.now()}`
    const chargeId = 'ch_test_123'

    const metadata = {
      userId: user.id as string,
      shippingAddress: JSON.stringify(shippingAddress),
      items: JSON.stringify([
        { productId: product.id as string, name: product.name, price: 10, quantity: 1, image: '' },
      ]),
    }

    const order = await createOrderFromWebhook(paymentIntentId, chargeId, metadata)
    expect(order.stripeChargeId).toBe(chargeId)
  })
})

// ── getOrdersByUser ──────────────────────────────────────────────────────────

describe('getOrdersByUser', () => {
  it('returns only orders belonging to the requesting user', async () => {
    const user1 = await seedUser()
    const user2 = await seedUser()
    const product = await seedProduct({ stockQuantity: 20 })

    // Create orders for both users
    for (const user of [user1, user2]) {
      const pi = `pi_test_${user.id}_${Date.now()}`
      const meta = {
        userId: user.id as string,
        shippingAddress: JSON.stringify(shippingAddress),
        items: JSON.stringify([
          { productId: product.id as string, name: product.name, price: 10, quantity: 1, image: '' },
        ]),
      }
      await createOrderFromWebhook(pi, null, meta)
    }

    const user1Orders = await getOrdersByUser(user1.id as string)
    expect(user1Orders).toHaveLength(1)
    expect(user1Orders[0]!.userId.toString()).toBe(user1.id)
  })

  it('returns an empty array when user has no orders', async () => {
    const user = await seedUser()
    const orders = await getOrdersByUser(user.id as string)
    expect(orders).toHaveLength(0)
  })

  it('returns orders sorted by createdAt descending', async () => {
    const user = await seedUser()
    const product = await seedProduct({ stockQuantity: 20 })

    for (let i = 0; i < 3; i++) {
      const pi = `pi_test_sort_${i}_${Date.now()}`
      const meta = {
        userId: user.id as string,
        shippingAddress: JSON.stringify(shippingAddress),
        items: JSON.stringify([
          { productId: product.id as string, name: product.name, price: 10, quantity: 1, image: '' },
        ]),
      }
      await createOrderFromWebhook(pi, null, meta)
      // Small delay to ensure distinct timestamps
      await new Promise((r) => setTimeout(r, 10))
    }

    const orders = await getOrdersByUser(user.id as string)
    expect(orders[0]!.createdAt.getTime()).toBeGreaterThanOrEqual(
      orders[1]!.createdAt.getTime()
    )
  })
})

// ── getOrderById ─────────────────────────────────────────────────────────────

describe('getOrderById', () => {
  it('returns the order when userId matches', async () => {
    const user = await seedUser()
    const product = await seedProduct({ stockQuantity: 5 })
    const pi = `pi_test_byid_${Date.now()}`
    const meta = {
      userId: user.id as string,
      shippingAddress: JSON.stringify(shippingAddress),
      items: JSON.stringify([
        { productId: product.id as string, name: product.name, price: 10, quantity: 1, image: '' },
      ]),
    }
    const created = await createOrderFromWebhook(pi, null, meta)

    const found = await getOrderById(created._id.toString(), user.id as string)
    expect(found._id.toString()).toBe(created._id.toString())
  })

  it('throws 404 when order belongs to a different user', async () => {
    const user1 = await seedUser()
    const user2 = await seedUser()
    const product = await seedProduct({ stockQuantity: 5 })
    const pi = `pi_test_auth_${Date.now()}`
    const meta = {
      userId: user1.id as string,
      shippingAddress: JSON.stringify(shippingAddress),
      items: JSON.stringify([
        { productId: product.id as string, name: product.name, price: 10, quantity: 1, image: '' },
      ]),
    }
    const created = await createOrderFromWebhook(pi, null, meta)

    await expect(
      getOrderById(created._id.toString(), user2.id as string)
    ).rejects.toMatchObject({ statusCode: 404 })
  })

  it('throws 404 for an invalid ObjectId format', async () => {
    await expect(getOrderById('not-an-id', 'any-user')).rejects.toMatchObject({
      statusCode: 404,
    })
  })
})

// ── updateOrderStatus ────────────────────────────────────────────────────────

describe('updateOrderStatus', () => {
  it('updates the order status', async () => {
    const user = await seedUser()
    const product = await seedProduct({ stockQuantity: 5 })
    const pi = `pi_test_status_${Date.now()}`
    const meta = {
      userId: user.id as string,
      shippingAddress: JSON.stringify(shippingAddress),
      items: JSON.stringify([
        { productId: product.id as string, name: product.name, price: 10, quantity: 1, image: '' },
      ]),
    }
    const created = await createOrderFromWebhook(pi, null, meta)

    const updated = await updateOrderStatus(created._id.toString(), 'shipped')
    expect(updated.status).toBe('shipped')
  })

  it('throws 404 for a non-existent order', async () => {
    await expect(
      updateOrderStatus(new mongoose.Types.ObjectId().toString(), 'shipped')
    ).rejects.toMatchObject({ statusCode: 404 })
  })
})

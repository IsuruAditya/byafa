/**
 * Test data factories — create consistent, minimal test fixtures.
 * All factories return plain objects; call the relevant Mongoose model
 * to persist them when needed.
 */

import mongoose from 'mongoose'

export function makeUserInput(overrides: Partial<{
  name: string
  email: string
  password: string
  role: 'customer' | 'admin'
}> = {}) {
  return {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    role: 'customer' as const,
    ...overrides,
  }
}

export function makeProductInput(overrides: Partial<{
  name: string
  description: string
  price: number
  category: string
  stockQuantity: number
  images: string[]
}> = {}) {
  return {
    name: 'Test Product',
    description: 'A test product description that is long enough.',
    price: 29.99,
    category: 'electronics',
    stockQuantity: 10,
    images: ['https://res.cloudinary.com/test/image/upload/test.jpg'],
    ...overrides,
  }
}

export function makeShippingAddress(overrides: Partial<{
  fullName: string
  addressLine1: string
  city: string
  state: string
  postalCode: string
  country: string
}> = {}) {
  return {
    fullName: 'Test User',
    addressLine1: '123 Test St',
    city: 'Testville',
    state: 'CA',
    postalCode: '90210',
    country: 'US',
    ...overrides,
  }
}

export function makeOrderInput(overrides: Partial<{
  userId: mongoose.Types.ObjectId | string
  items: Array<{ productId: string; name: string; price: number; quantity: number; image: string }>
  totalAmount: number
  stripePaymentIntentId: string
  status: string
}> = {}) {
  return {
    userId: new mongoose.Types.ObjectId(),
    items: [
      {
        productId: new mongoose.Types.ObjectId().toString(),
        name: 'Test Product',
        price: 29.99,
        quantity: 2,
        image: '',
      },
    ],
    shippingAddress: makeShippingAddress(),
    totalAmount: 59.98,
    stripePaymentIntentId: `pi_test_${Date.now()}`,
    status: 'pending',
    ...overrides,
  }
}

import { http, HttpResponse } from 'msw'

const API = 'http://localhost:5000/api/v1'

// ── Shared mock data ──────────────────────────────────────────────────────────

export const mockUser = {
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
  role: 'customer' as const,
}

export const mockAdminUser = {
  id: 'admin-123',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin' as const,
}

export const mockProduct = {
  _id: 'product-123',
  name: 'Test Product',
  description: 'A great test product with a long enough description.',
  price: 29.99,
  category: 'electronics',
  stockQuantity: 10,
  images: ['https://placehold.co/400x400'],
  ratings: { average: 4.5, count: 12 },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const mockOrder = {
  _id: 'order-123',
  userId: 'user-123',
  items: [
    {
      productId: 'product-123',
      name: 'Test Product',
      price: 29.99,
      quantity: 2,
      image: '',
    },
  ],
  shippingAddress: {
    fullName: 'Test User',
    addressLine1: '123 Test St',
    city: 'Testville',
    state: 'CA',
    postalCode: '90210',
    country: 'US',
  },
  totalAmount: 59.98,
  status: 'processing',
  stripePaymentIntentId: 'pi_test_123',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// ── Auth handlers ─────────────────────────────────────────────────────────────

export const authHandlers = [
  http.post(`${API}/auth/login`, () =>
    HttpResponse.json({
      success: true,
      message: 'Login successful',
      data: { user: mockUser, accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' },
    })
  ),

  http.post(`${API}/auth/register`, () =>
    HttpResponse.json(
      {
        success: true,
        message: 'Registration successful',
        data: { user: mockUser, accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' },
      },
      { status: 201 }
    )
  ),

  http.post(`${API}/auth/logout`, () =>
    HttpResponse.json({ success: true, message: 'Logged out successfully' })
  ),

  http.post(`${API}/auth/refresh`, () =>
    HttpResponse.json({
      success: true,
      data: { accessToken: 'new-mock-access-token' },
    })
  ),

  http.get(`${API}/auth/me`, () =>
    HttpResponse.json({
      success: true,
      data: { user: mockUser },
    })
  ),
]

// ── Product handlers ──────────────────────────────────────────────────────────

export const productHandlers = [
  http.get(`${API}/products`, () =>
    HttpResponse.json({
      success: true,
      data: [mockProduct],
      pagination: { page: 1, pageSize: 12, total: 1, totalPages: 1 },
    })
  ),

  http.get(`${API}/products/:id`, ({ params }) => {
    if (params['id'] === mockProduct._id) {
      return HttpResponse.json({ success: true, data: mockProduct })
    }
    return HttpResponse.json({ success: false, message: 'Product not found' }, { status: 404 })
  }),
]

// ── Order handlers ────────────────────────────────────────────────────────────

export const orderHandlers = [
  http.get(`${API}/orders`, () =>
    HttpResponse.json({ success: true, data: [mockOrder] })
  ),

  http.get(`${API}/orders/:id`, ({ params }) => {
    if (params['id'] === mockOrder._id) {
      return HttpResponse.json({ success: true, data: mockOrder })
    }
    return HttpResponse.json({ success: false, message: 'Order not found' }, { status: 404 })
  }),

  http.post(`${API}/orders/create-payment-intent`, () =>
    HttpResponse.json({
      success: true,
      data: { clientSecret: 'pi_test_secret_123', totalAmount: 59.98 },
    })
  ),
]

// ── Default export — all handlers combined ────────────────────────────────────

export const handlers = [...authHandlers, ...productHandlers, ...orderHandlers]

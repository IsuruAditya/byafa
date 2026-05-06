import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { configureStore } from '@reduxjs/toolkit'
import authReducer, { type AuthUser } from '../store/slices/authSlice'
import cartReducer, { type CartItem } from '../store/slices/cartSlice'
import uiReducer from '../store/slices/uiSlice'
import type { RootState } from '../store'

// ── Store factory ─────────────────────────────────────────────────────────────

interface PreloadedState {
  auth?: Partial<RootState['auth']>
  cart?: Partial<RootState['cart']>
  ui?: Partial<RootState['ui']>
}

export function createTestStore(preloadedState: PreloadedState = {}) {
  return configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      ui: uiReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        accessToken: null,
        isAuthenticated: false,
        ...preloadedState.auth,
      },
      cart: {
        items: [],
        ...preloadedState.cart,
      },
      ui: {
        toasts: [],
        isCartOpen: false,
        isMobileMenuOpen: false,
        ...preloadedState.ui,
      },
    },
  })
}

// ── Render with providers ─────────────────────────────────────────────────────

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: PreloadedState
  routerProps?: MemoryRouterProps
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    routerProps = {},
    ...renderOptions
  }: RenderWithProvidersOptions = {}
) {
  const store = createTestStore(preloadedState)

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <HelmetProvider>
          <MemoryRouter {...routerProps}>{children}</MemoryRouter>
        </HelmetProvider>
      </Provider>
    )
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

// ── Common mock data ──────────────────────────────────────────────────────────

export const mockAuthUser: AuthUser = {
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
  role: 'customer',
}

export const mockAdminUser: AuthUser = {
  id: 'admin-123',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
}

export const mockCartItem: CartItem = {
  productId: 'product-123',
  name: 'Test Product',
  price: 29.99,
  image: 'https://placehold.co/80x80',
  quantity: 2,
  stockQuantity: 10,
}

export const mockProduct = {
  _id: 'product-123',
  name: 'Test Product',
  description: 'A great test product.',
  price: 29.99,
  category: 'electronics',
  stockQuantity: 10,
  images: ['https://placehold.co/400x400'],
  ratings: { average: 4.5, count: 12 },
}

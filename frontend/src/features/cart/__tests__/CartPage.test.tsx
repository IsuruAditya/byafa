import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, mockCartItem, mockAuthUser } from '../../../test/utils'
import CartPage from '../CartPage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('CartPage', () => {
  it('shows empty cart state when cart is empty', () => {
    renderWithProviders(<CartPage />)

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /browse products/i })).toBeInTheDocument()
  })

  it('renders cart items when cart has items', () => {
    renderWithProviders(<CartPage />, {
      preloadedState: { cart: { items: [mockCartItem] } },
    })

    expect(screen.getByText(mockCartItem.name)).toBeInTheDocument()
    expect(screen.queryByText(/your cart is empty/i)).not.toBeInTheDocument()
  })

  it('displays the correct subtotal', () => {
    renderWithProviders(<CartPage />, {
      preloadedState: { cart: { items: [mockCartItem] } },
    })

    // 29.99 × 2 = 59.98
    expect(screen.getAllByText(/\$59\.98/).length).toBeGreaterThan(0)
  })

  it('shows item count in heading', () => {
    renderWithProviders(<CartPage />, {
      preloadedState: { cart: { items: [mockCartItem] } },
    })

    expect(screen.getByText(/2 items/i)).toBeInTheDocument()
  })

  it('navigates to checkout when authenticated user clicks proceed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CartPage />, {
      preloadedState: {
        cart: { items: [mockCartItem] },
        auth: { user: mockAuthUser, accessToken: 'token', isAuthenticated: true },
      },
    })

    await user.click(screen.getByRole('button', { name: /proceed to checkout/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/checkout')
  })

  it('redirects to login when unauthenticated user clicks proceed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CartPage />, {
      preloadedState: { cart: { items: [mockCartItem] } },
    })

    await user.click(screen.getByRole('button', { name: /proceed to checkout/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/login', {
      state: { from: { pathname: '/checkout' } },
    })
  })

  it('shows sign-in reminder for unauthenticated users', () => {
    renderWithProviders(<CartPage />, {
      preloadedState: { cart: { items: [mockCartItem] } },
    })

    expect(screen.getByText(/you'll be asked to sign in/i)).toBeInTheDocument()
  })

  it('does not show sign-in reminder for authenticated users', () => {
    renderWithProviders(<CartPage />, {
      preloadedState: {
        cart: { items: [mockCartItem] },
        auth: { user: mockAuthUser, accessToken: 'token', isAuthenticated: true },
      },
    })

    expect(screen.queryByText(/you'll be asked to sign in/i)).not.toBeInTheDocument()
  })
})

import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, mockCartItem } from '../../../test/utils'
import { CartItemRow } from '../CartItemRow'

describe('CartItemRow', () => {
  it('renders item name, price, and quantity', () => {
    renderWithProviders(<CartItemRow item={mockCartItem} />)

    expect(screen.getByText(mockCartItem.name)).toBeInTheDocument()
    expect(screen.getByText(/\$29\.99/)).toBeInTheDocument()
    expect(screen.getByDisplayValue('2')).toBeInTheDocument() // quantity input
  })

  it('renders the line total (price × quantity)', () => {
    renderWithProviders(<CartItemRow item={mockCartItem} />)
    // 29.99 × 2 = 59.98
    expect(screen.getByText(/\$59\.98/)).toBeInTheDocument()
  })

  it('dispatches updateQuantity when + button is clicked', async () => {
    const user = userEvent.setup()
    const { store } = renderWithProviders(
      <CartItemRow item={mockCartItem} />,
      { preloadedState: { cart: { items: [mockCartItem] } } }
    )

    await user.click(screen.getByRole('button', { name: /increase quantity/i }))

    const items = store.getState().cart.items
    expect(items[0]!.quantity).toBe(3)
  })

  it('dispatches updateQuantity when − button is clicked', async () => {
    const user = userEvent.setup()
    const { store } = renderWithProviders(
      <CartItemRow item={mockCartItem} />,
      { preloadedState: { cart: { items: [mockCartItem] } } }
    )

    await user.click(screen.getByRole('button', { name: /decrease quantity/i }))

    const items = store.getState().cart.items
    expect(items[0]!.quantity).toBe(1)
  })

  it('disables − button when quantity is 1', () => {
    renderWithProviders(
      <CartItemRow item={{ ...mockCartItem, quantity: 1 }} />
    )
    expect(screen.getByRole('button', { name: /decrease quantity/i })).toBeDisabled()
  })

  it('disables + button when quantity equals stockQuantity', () => {
    renderWithProviders(
      <CartItemRow item={{ ...mockCartItem, quantity: 10, stockQuantity: 10 }} />
    )
    expect(screen.getByRole('button', { name: /increase quantity/i })).toBeDisabled()
  })

  it('removes item when Remove is clicked', async () => {
    const user = userEvent.setup()
    const { store } = renderWithProviders(
      <CartItemRow item={mockCartItem} />,
      { preloadedState: { cart: { items: [mockCartItem] } } }
    )

    await user.click(screen.getByRole('button', { name: /remove/i }))

    expect(store.getState().cart.items).toHaveLength(0)
  })
})

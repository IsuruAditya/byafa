import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { renderWithProviders } from '../../../test/utils'
import { server } from '../../../test/mocks/server'
import RegisterPage from '../RegisterPage'

const API = 'http://localhost:5000/api/v1'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

async function fillAndSubmit(
  user: ReturnType<typeof userEvent.setup>,
  overrides: Partial<{
    name: string
    email: string
    password: string
    confirmPassword: string
  }> = {}
) {
  const values = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
    ...overrides,
  }
  await user.type(screen.getByLabelText(/full name/i), values.name)
  await user.type(screen.getByLabelText(/^email/i), values.email)
  await user.type(screen.getByLabelText(/^password/i), values.password)
  await user.type(screen.getByLabelText(/confirm password/i), values.confirmPassword)
  await user.click(screen.getByRole('button', { name: /create account/i }))
}

describe('RegisterPage', () => {
  it('renders all form fields', () => {
    renderWithProviders(<RegisterPage />)

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('shows validation error when name is empty', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)

    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    })
  })

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)

    await fillAndSubmit(user, { confirmPassword: 'different123' })

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  it('shows error when password is too short', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)

    await fillAndSubmit(user, { password: 'short', confirmPassword: 'short' })

    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('dispatches setCredentials and navigates on success', async () => {
    const user = userEvent.setup()
    const { store } = renderWithProviders(<RegisterPage />)

    await fillAndSubmit(user)

    await waitFor(() => {
      expect(store.getState().auth.isAuthenticated).toBe(true)
    })

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })

  it('shows error message on 409 duplicate email', async () => {
    server.use(
      http.post(`${API}/auth/register`, () =>
        HttpResponse.json(
          { success: false, message: 'Email already in use' },
          { status: 409 }
        )
      )
    )

    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)

    await fillAndSubmit(user)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/email already in use/i)
    })
  })

  it('has a link to the login page', () => {
    renderWithProviders(<RegisterPage />)
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login')
  })
})

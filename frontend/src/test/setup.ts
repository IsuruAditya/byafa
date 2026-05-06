import '@testing-library/jest-dom'
import { server } from './mocks/server'
import { beforeAll, afterAll, afterEach } from 'vitest'

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))

// Reset handlers after each test (prevents test pollution)
afterEach(() => server.resetHandlers())

// Clean up after all tests
afterAll(() => server.close())

// Suppress console.warn/error noise in tests unless explicitly needed
// Comment these out when debugging a specific test
const originalWarn = console.warn
const originalError = console.error

beforeAll(() => {
  console.warn = (...args: unknown[]) => {
    // Allow through warnings that are actually useful
    const msg = String(args[0])
    if (msg.includes('Warning: ReactDOM.render') || msg.includes('act(')) return
    originalWarn(...args)
  }
  console.error = (...args: unknown[]) => {
    const msg = String(args[0])
    // Suppress known React testing noise
    if (msg.includes('Warning:') || msg.includes('Error: Not implemented')) return
    originalError(...args)
  }
})

afterAll(() => {
  console.warn = originalWarn
  console.error = originalError
})

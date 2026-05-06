/**
 * Integration test helpers — create authenticated request agents and
 * seed common test data without going through the HTTP layer.
 */

import request from 'supertest'
import app from '../app'
import { User } from '../models/User.model'
import { generateAccessToken } from '../utils/generateTokens'
import { makeUserInput } from './factories'
import type { IUser } from '../models/User.model'

export { app }

/**
 * Creates a user in the DB and returns a valid Bearer token for them.
 * Use this to authenticate requests in integration tests.
 */
export async function createAuthToken(
  role: 'customer' | 'admin' = 'customer'
): Promise<{ token: string; user: IUser }> {
  const input = makeUserInput({ role })
  const user = await User.create(input)
  const token = generateAccessToken({ userId: user.id as string, role: user.role })
  return { token, user }
}

/**
 * Returns a supertest agent with the Authorization header pre-set.
 */
export function authedRequest(token: string) {
  return {
    get: (url: string) =>
      request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string) =>
      request(app).post(url).set('Authorization', `Bearer ${token}`),
    patch: (url: string) =>
      request(app).patch(url).set('Authorization', `Bearer ${token}`),
    put: (url: string) =>
      request(app).put(url).set('Authorization', `Bearer ${token}`),
    delete: (url: string) =>
      request(app).delete(url).set('Authorization', `Bearer ${token}`),
  }
}

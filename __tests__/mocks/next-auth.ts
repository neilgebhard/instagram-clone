import { vi } from 'vitest'

export const mockAuth = vi.fn()

// Mock authenticated session
export const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'testuser',
  },
  expires: '2025-12-31',
}

// Mock unauthenticated session
export const mockNoSession = null

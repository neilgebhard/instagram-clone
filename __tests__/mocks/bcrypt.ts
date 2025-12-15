import { vi } from 'vitest'

export const bcryptMock = {
  hash: vi.fn(),
  compare: vi.fn(),
}

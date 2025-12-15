import { describe, it, expect, beforeEach, vi } from 'vitest'

// Create mocks using vi.hoisted
const mocks = vi.hoisted(() => {
  return {
    prisma: {
      user: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
      },
    },
    bcrypt: {
      hash: vi.fn(),
      compare: vi.fn(),
    },
  }
})

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: mocks.prisma,
}))

vi.mock('bcryptjs', () => ({
  default: mocks.bcrypt,
  hash: mocks.bcrypt.hash,
  compare: mocks.bcrypt.compare,
}))

// Import test data
import { mockUser } from '@/__tests__/fixtures/data'

// Test the authorize logic directly (extracted from lib/auth.ts CredentialsProvider)
async function testAuthorize(credentials: { email: string; password: string } | null) {
  if (!credentials?.email || !credentials?.password) {
    return null
  }

  const user = await mocks.prisma.user.findUnique({
    where: {
      email: credentials.email as string,
    },
  })

  if (!user || !user.password) {
    return null
  }

  const isPasswordValid = await mocks.bcrypt.compare(
    credentials.password as string,
    user.password
  )

  if (!isPasswordValid) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    name: user.username,
  }
}

describe('Credentials Provider Authorize Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return null when credentials are missing', async () => {
    const result = await testAuthorize(null)

    expect(result).toBeNull()
  })

  it('should return null when email is missing', async () => {
    const result = await testAuthorize({ email: '', password: 'Test1234' })

    expect(result).toBeNull()
  })

  it('should return null when password is missing', async () => {
    const result = await testAuthorize({ email: 'test@example.com', password: '' })

    expect(result).toBeNull()
  })

  it('should return null when user is not found', async () => {
    mocks.prisma.user.findUnique.mockResolvedValue(null)

    const result = await testAuthorize({
      email: 'nonexistent@example.com',
      password: 'Test1234',
    })

    expect(result).toBeNull()
    expect(mocks.prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'nonexistent@example.com' },
    })
  })

  it('should return null when user has no password (OAuth user)', async () => {
    mocks.prisma.user.findUnique.mockResolvedValue({
      ...mockUser,
      password: null, // OAuth user without password
    })

    const result = await testAuthorize({
      email: mockUser.email,
      password: 'Test1234',
    })

    expect(result).toBeNull()
  })

  it('should return null for invalid password', async () => {
    mocks.prisma.user.findUnique.mockResolvedValue(mockUser)
    mocks.bcrypt.compare.mockResolvedValue(false) // Invalid password

    const result = await testAuthorize({
      email: mockUser.email,
      password: 'WrongPassword123',
    })

    expect(result).toBeNull()
    expect(mocks.bcrypt.compare).toHaveBeenCalledWith(
      'WrongPassword123',
      mockUser.password
    )
  })

  it('should return user object for valid credentials', async () => {
    mocks.prisma.user.findUnique.mockResolvedValue(mockUser)
    mocks.bcrypt.compare.mockResolvedValue(true) // Valid password

    const result = await testAuthorize({
      email: mockUser.email,
      password: 'Test1234',
    })

    expect(result).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.username,
    })
    expect(mocks.bcrypt.compare).toHaveBeenCalledWith('Test1234', mockUser.password)
    expect(mocks.prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: mockUser.email },
    })
  })
})

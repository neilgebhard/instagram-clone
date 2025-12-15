import { describe, it, expect, beforeEach, vi } from 'vitest'

// Create mocks using vi.hoisted - must be before any imports except vitest
const mocks = vi.hoisted(() => {
  return {
    prisma: {
      user: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
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

// Now we can import
import { mockUser } from '@/__tests__/fixtures/data'
import { POST } from './route'

describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Password Validation', () => {
    it('should reject password shorter than 8 characters', async () => {
      const request = new Request('http://localhost/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          username: 'testuser',
          password: 'Test1', // Only 5 characters
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Password must be at least 8 characters')
    })

    it('should reject password without uppercase letter', async () => {
      const request = new Request('http://localhost/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          username: 'testuser',
          password: 'test1234', // No uppercase
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Password must contain at least one uppercase letter')
    })

    it('should reject password without lowercase letter', async () => {
      const request = new Request('http://localhost/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          username: 'testuser',
          password: 'TEST1234', // No lowercase
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Password must contain at least one lowercase letter')
    })

    it('should reject password without number', async () => {
      const request = new Request('http://localhost/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          username: 'testuser',
          password: 'TestTest', // No number
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Password must contain at least one number')
    })

    it('should accept valid password and hash it correctly', async () => {
      const hashedPassword = '$2a$10$hashedpassword123'
      mocks.bcrypt.hash.mockResolvedValue(hashedPassword)
      mocks.prisma.user.findFirst.mockResolvedValue(null) // No existing user
      mocks.prisma.user.create.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      })

      const request = new Request('http://localhost/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          username: 'testuser',
          password: 'Test1234', // Valid password
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(mocks.bcrypt.hash).toHaveBeenCalledWith('Test1234', 10)
      expect(data.success).toBe(true)
    })
  })

  describe('Uniqueness Validation', () => {
    it('should reject signup with existing email', async () => {
      mocks.prisma.user.findFirst.mockResolvedValue(mockUser) // Email exists

      const request = new Request('http://localhost/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: mockUser.email,
          username: 'newusername',
          password: 'Test1234',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('User with this email or username already exists')
    })

    it('should reject signup with existing username', async () => {
      mocks.prisma.user.findFirst.mockResolvedValue(mockUser) // Username exists

      const request = new Request('http://localhost/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'newemail@example.com',
          username: mockUser.username,
          password: 'Test1234',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('User with this email or username already exists')
    })

    it('should create user with valid unique credentials', async () => {
      const hashedPassword = '$2a$10$hashedpassword123'
      mocks.bcrypt.hash.mockResolvedValue(hashedPassword)
      mocks.prisma.user.findFirst.mockResolvedValue(null) // No existing user
      mocks.prisma.user.create.mockResolvedValue({
        id: 'new-user-id',
        email: 'newuser@example.com',
        username: 'newuser',
        password: hashedPassword,
        avatar: null,
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const request = new Request('http://localhost/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'newuser@example.com',
          username: 'newuser',
          password: 'Test1234',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe('newuser@example.com')
      expect(data.user.username).toBe('newuser')
    })
  })
})

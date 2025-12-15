import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prismaMock } from '@/__tests__/mocks/prisma'
import { mockAuth, mockSession, mockNoSession } from '@/__tests__/mocks/next-auth'
import { mockUser } from '@/__tests__/fixtures/data'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  default: prismaMock,
}))

vi.mock('@/lib/auth', () => ({
  auth: mockAuth,
}))

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Import after mocks are set up
const { updateUserProfile } = await import('./users')

describe('Users Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('updateUserProfile - Validation', () => {
    it('should return error when not authenticated', async () => {
      mockAuth.mockResolvedValue(mockNoSession)

      const result = await updateUserProfile({
        username: 'testuser',
        email: 'test@example.com',
        bio: 'Test bio',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
      expect(result.field).toBe('general')
    })

    it('should reject invalid email format', async () => {
      mockAuth.mockResolvedValue(mockSession)

      const result = await updateUserProfile({
        username: 'testuser',
        email: 'invalid-email', // No @ or domain
        bio: 'Test bio',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid email format')
      expect(result.field).toBe('email')
    })

    it('should reject email without domain', async () => {
      mockAuth.mockResolvedValue(mockSession)

      const result = await updateUserProfile({
        username: 'testuser',
        email: 'test@invalid',
        bio: null,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid email format')
    })

    it('should reject username with special characters', async () => {
      mockAuth.mockResolvedValue(mockSession)

      const result = await updateUserProfile({
        username: 'test-user!', // Hyphens and exclamation marks not allowed
        email: 'test@example.com',
        bio: null,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Username must be 3-30 characters (letters, numbers, underscores)'
      )
      expect(result.field).toBe('username')
    })

    it('should reject username with spaces', async () => {
      mockAuth.mockResolvedValue(mockSession)

      const result = await updateUserProfile({
        username: 'test user',
        email: 'test@example.com',
        bio: null,
      })

      expect(result.success).toBe(false)
      expect(result.field).toBe('username')
    })

    it('should reject username shorter than 3 characters', async () => {
      mockAuth.mockResolvedValue(mockSession)

      const result = await updateUserProfile({
        username: 'ab', // Only 2 characters
        email: 'test@example.com',
        bio: null,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Username must be 3-30 characters (letters, numbers, underscores)'
      )
      expect(result.field).toBe('username')
    })

    it('should reject username longer than 30 characters', async () => {
      mockAuth.mockResolvedValue(mockSession)

      const result = await updateUserProfile({
        username: 'a'.repeat(31), // 31 characters
        email: 'test@example.com',
        bio: null,
      })

      expect(result.success).toBe(false)
      expect(result.field).toBe('username')
    })

    it('should reject bio longer than 150 characters', async () => {
      mockAuth.mockResolvedValue(mockSession)

      const result = await updateUserProfile({
        username: 'testuser',
        email: 'test@example.com',
        bio: 'a'.repeat(151), // 151 characters
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Bio must be 150 characters or less')
      expect(result.field).toBe('bio')
    })

    it('should accept bio exactly 150 characters', async () => {
      mockAuth.mockResolvedValue(mockSession)
      prismaMock.user.findUnique
        .mockResolvedValueOnce(mockUser) // getCurrentUser
        .mockResolvedValueOnce(null) // username uniqueness check
      prismaMock.user.update.mockResolvedValue({
        ...mockUser,
        bio: 'a'.repeat(150),
      })

      const result = await updateUserProfile({
        username: 'newusername',
        email: mockUser.email,
        bio: 'a'.repeat(150), // Exactly 150 characters
      })

      expect(result.success).toBe(true)
    })

    it('should trim whitespace from inputs', async () => {
      mockAuth.mockResolvedValue(mockSession)
      prismaMock.user.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null) // username check
        .mockResolvedValueOnce(null) // email check
      prismaMock.user.update.mockResolvedValue({
        ...mockUser,
        username: 'testuser',
        email: 'test@example.com',
        bio: 'Test bio',
      })

      await updateUserProfile({
        username: '  testuser  ',
        email: '  test@example.com  ',
        bio: '  Test bio  ',
      })

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: mockSession.user.id },
        data: {
          username: 'testuser', // Trimmed
          email: 'test@example.com', // Trimmed
          bio: 'Test bio', // Trimmed
        },
        select: {
          id: true,
          username: true,
          email: true,
          bio: true,
          avatar: true,
        },
      })
    })

    it('should accept valid username with underscores and numbers', async () => {
      mockAuth.mockResolvedValue(mockSession)
      prismaMock.user.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null)
      prismaMock.user.update.mockResolvedValue({
        ...mockUser,
        username: 'test_user_123',
      })

      const result = await updateUserProfile({
        username: 'test_user_123',
        email: mockUser.email,
        bio: null,
      })

      expect(result.success).toBe(true)
    })
  })

  describe('updateUserProfile - Uniqueness', () => {
    it('should reject username change to existing username', async () => {
      mockAuth.mockResolvedValue(mockSession)
      prismaMock.user.findUnique
        .mockResolvedValueOnce(mockUser) // Get current user
        .mockResolvedValueOnce({ id: 'other-user-id', username: 'existinguser' }) // Username exists

      const result = await updateUserProfile({
        username: 'existinguser', // Already taken
        email: mockUser.email,
        bio: null,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Username is already taken')
      expect(result.field).toBe('username')
    })

    it('should allow keeping same username (no change)', async () => {
      mockAuth.mockResolvedValue(mockSession)
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser) // Get current user
      // No second findUnique call because username hasn't changed
      prismaMock.user.update.mockResolvedValue(mockUser)

      const result = await updateUserProfile({
        username: mockUser.username, // Same username
        email: mockUser.email,
        bio: 'New bio',
      })

      expect(result.success).toBe(true)
      // Should NOT check for username uniqueness
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1) // Only getCurrentUser
    })

    it('should reject email change to existing email', async () => {
      mockAuth.mockResolvedValue(mockSession)
      prismaMock.user.findUnique
        .mockResolvedValueOnce(mockUser) // Get current user
        .mockResolvedValueOnce({ id: 'other-user-id', email: 'existing@example.com' }) // Email exists

      const result = await updateUserProfile({
        username: mockUser.username,
        email: 'existing@example.com', // Already in use
        bio: null,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email is already in use')
      expect(result.field).toBe('email')
    })

    it('should allow keeping same email (no change)', async () => {
      mockAuth.mockResolvedValue(mockSession)
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser)
      prismaMock.user.update.mockResolvedValue(mockUser)

      const result = await updateUserProfile({
        username: mockUser.username,
        email: mockUser.email, // Same email
        bio: 'Updated bio',
      })

      expect(result.success).toBe(true)
      // Should NOT check for email uniqueness
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1)
    })

    it('should update profile with all fields changed', async () => {
      mockAuth.mockResolvedValue(mockSession)
      const updatedUser = {
        ...mockUser,
        username: 'newusername',
        email: 'newemail@example.com',
        bio: 'New bio text',
        avatar: 'https://bucket.s3.amazonaws.com/avatars/new.jpg',
      }
      prismaMock.user.findUnique
        .mockResolvedValueOnce(mockUser) // Get current user
        .mockResolvedValueOnce(null) // Username available
        .mockResolvedValueOnce(null) // Email available
      prismaMock.user.update.mockResolvedValue(updatedUser)

      const result = await updateUserProfile({
        username: 'newusername',
        email: 'newemail@example.com',
        bio: 'New bio text',
        avatar: 'https://bucket.s3.amazonaws.com/avatars/new.jpg',
      })

      expect(result.success).toBe(true)
      expect(result.user).toEqual(updatedUser)
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: mockSession.user.id },
        data: {
          username: 'newusername',
          email: 'newemail@example.com',
          bio: 'New bio text',
          avatar: 'https://bucket.s3.amazonaws.com/avatars/new.jpg',
        },
        select: {
          id: true,
          username: true,
          email: true,
          bio: true,
          avatar: true,
        },
      })
    })
  })
})

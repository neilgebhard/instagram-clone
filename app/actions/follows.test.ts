import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prismaMock } from '@/__tests__/mocks/prisma'
import { mockAuth, mockSession, mockNoSession } from '@/__tests__/mocks/next-auth'
import { mockFollow } from '@/__tests__/fixtures/data'

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
const { toggleFollow } = await import('./follows')

describe('Follow Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('toggleFollow', () => {
    it('should throw error when not authenticated', async () => {
      mockAuth.mockResolvedValue(mockNoSession)

      await expect(toggleFollow('user-456')).rejects.toThrow('Unauthorized')
    })

    it('should throw error when trying to follow self', async () => {
      mockAuth.mockResolvedValue(mockSession)

      await expect(toggleFollow(mockSession.user.id)).rejects.toThrow(
        'Cannot follow yourself'
      )
    })

    it('should create follow when none exists and return {following: true}', async () => {
      mockAuth.mockResolvedValue(mockSession)
      prismaMock.follow.findUnique.mockResolvedValue(null) // No existing follow
      prismaMock.follow.create.mockResolvedValue(mockFollow)

      const result = await toggleFollow('user-456')

      expect(result).toEqual({ success: true, following: true })
      expect(prismaMock.follow.findUnique).toHaveBeenCalledWith({
        where: {
          followerId_followingId: {
            followerId: mockSession.user.id,
            followingId: 'user-456',
          },
        },
      })
      expect(prismaMock.follow.create).toHaveBeenCalledWith({
        data: {
          followerId: mockSession.user.id,
          followingId: 'user-456',
        },
      })
    })

    it('should delete follow when exists and return {following: false}', async () => {
      mockAuth.mockResolvedValue(mockSession)
      prismaMock.follow.findUnique.mockResolvedValue(mockFollow) // Existing follow
      prismaMock.follow.delete.mockResolvedValue(mockFollow)

      const result = await toggleFollow('user-456')

      expect(result).toEqual({ success: true, following: false })
      expect(prismaMock.follow.findUnique).toHaveBeenCalledWith({
        where: {
          followerId_followingId: {
            followerId: mockSession.user.id,
            followingId: 'user-456',
          },
        },
      })
      expect(prismaMock.follow.delete).toHaveBeenCalledWith({
        where: {
          id: mockFollow.id,
        },
      })
    })

    it('should use composite unique key (followerId + followingId)', async () => {
      mockAuth.mockResolvedValue(mockSession)
      prismaMock.follow.findUnique.mockResolvedValue(null)
      prismaMock.follow.create.mockResolvedValue(mockFollow)

      await toggleFollow('user-789')

      expect(prismaMock.follow.findUnique).toHaveBeenCalledWith({
        where: {
          followerId_followingId: {
            followerId: mockSession.user.id,
            followingId: 'user-789',
          },
        },
      })
    })

    it('should toggle multiple times correctly', async () => {
      mockAuth.mockResolvedValue(mockSession)

      // First toggle: create follow
      prismaMock.follow.findUnique.mockResolvedValue(null)
      prismaMock.follow.create.mockResolvedValue(mockFollow)
      const firstResult = await toggleFollow('user-456')
      expect(firstResult.following).toBe(true)

      vi.clearAllMocks()

      // Second toggle: delete follow
      mockAuth.mockResolvedValue(mockSession)
      prismaMock.follow.findUnique.mockResolvedValue(mockFollow)
      prismaMock.follow.delete.mockResolvedValue(mockFollow)
      const secondResult = await toggleFollow('user-456')
      expect(secondResult.following).toBe(false)
    })
  })
})

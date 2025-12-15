import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prismaMock } from '@/__tests__/mocks/prisma'
import { mockAuth, mockSession, mockNoSession } from '@/__tests__/mocks/next-auth'
import { mockLike } from '@/__tests__/fixtures/data'

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
const { toggleLike } = await import('./likes')

describe('Likes Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('toggleLike', () => {
    it('should throw error when not authenticated', async () => {
      mockAuth.mockResolvedValue(mockNoSession)

      await expect(toggleLike('post-123')).rejects.toThrow('Unauthorized')
    })

    it('should create like when none exists and return {liked: true}', async () => {
      mockAuth.mockResolvedValue(mockSession)
      prismaMock.like.findUnique.mockResolvedValue(null) // No existing like
      prismaMock.like.create.mockResolvedValue(mockLike)

      const result = await toggleLike('post-123')

      expect(result).toEqual({ success: true, liked: true })
      expect(prismaMock.like.findUnique).toHaveBeenCalledWith({
        where: {
          userId_postId: {
            userId: mockSession.user.id,
            postId: 'post-123',
          },
        },
      })
      expect(prismaMock.like.create).toHaveBeenCalledWith({
        data: {
          userId: mockSession.user.id,
          postId: 'post-123',
        },
      })
    })

    it('should delete like when exists and return {liked: false}', async () => {
      mockAuth.mockResolvedValue(mockSession)
      prismaMock.like.findUnique.mockResolvedValue(mockLike) // Existing like
      prismaMock.like.delete.mockResolvedValue(mockLike)

      const result = await toggleLike('post-123')

      expect(result).toEqual({ success: true, liked: false })
      expect(prismaMock.like.findUnique).toHaveBeenCalledWith({
        where: {
          userId_postId: {
            userId: mockSession.user.id,
            postId: 'post-123',
          },
        },
      })
      expect(prismaMock.like.delete).toHaveBeenCalledWith({
        where: {
          id: mockLike.id,
        },
      })
    })

    it('should use composite unique key (userId + postId)', async () => {
      mockAuth.mockResolvedValue(mockSession)
      prismaMock.like.findUnique.mockResolvedValue(null)
      prismaMock.like.create.mockResolvedValue(mockLike)

      await toggleLike('different-post-id')

      expect(prismaMock.like.findUnique).toHaveBeenCalledWith({
        where: {
          userId_postId: {
            userId: mockSession.user.id,
            postId: 'different-post-id',
          },
        },
      })
    })

    it('should toggle multiple times correctly', async () => {
      mockAuth.mockResolvedValue(mockSession)

      // First toggle: create like
      prismaMock.like.findUnique.mockResolvedValue(null)
      prismaMock.like.create.mockResolvedValue(mockLike)
      const firstResult = await toggleLike('post-123')
      expect(firstResult.liked).toBe(true)

      vi.clearAllMocks()

      // Second toggle: delete like
      mockAuth.mockResolvedValue(mockSession)
      prismaMock.like.findUnique.mockResolvedValue(mockLike)
      prismaMock.like.delete.mockResolvedValue(mockLike)
      const secondResult = await toggleLike('post-123')
      expect(secondResult.liked).toBe(false)
    })
  })
})

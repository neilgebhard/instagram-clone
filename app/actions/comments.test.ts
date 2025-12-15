import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prismaMock } from '@/__tests__/mocks/prisma'
import { mockAuth, mockSession, mockNoSession } from '@/__tests__/mocks/next-auth'
import { mockComment, mockUser } from '@/__tests__/fixtures/data'

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
const { createComment, deleteComment } = await import('./comments')

describe('Comments Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createComment', () => {
    it('should throw error when not authenticated', async () => {
      mockAuth.mockResolvedValue(mockNoSession)

      await expect(createComment('post-123', 'Great post!')).rejects.toThrow(
        'Unauthorized'
      )
    })

    it('should reject empty content', async () => {
      mockAuth.mockResolvedValue(mockSession)

      await expect(createComment('post-123', '')).rejects.toThrow(
        'Comment cannot be empty'
      )
    })

    it('should reject whitespace-only content', async () => {
      mockAuth.mockResolvedValue(mockSession)

      await expect(createComment('post-123', '   ')).rejects.toThrow(
        'Comment cannot be empty'
      )
    })

    it('should trim and save comment with user data', async () => {
      mockAuth.mockResolvedValue(mockSession)
      const commentWithUser = {
        ...mockComment,
        content: 'Great post!',
        user: {
          id: mockUser.id,
          username: mockUser.username,
          avatar: mockUser.avatar,
        },
      }
      prismaMock.comment.create.mockResolvedValue(commentWithUser)

      const result = await createComment('post-123', '  Great post!  ')

      expect(result.success).toBe(true)
      expect(result.comment).toEqual(commentWithUser)
      expect(prismaMock.comment.create).toHaveBeenCalledWith({
        data: {
          content: 'Great post!', // Trimmed
          userId: mockSession.user.id,
          postId: 'post-123',
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      })
    })

    it('should create comment with newlines preserved', async () => {
      mockAuth.mockResolvedValue(mockSession)
      const multilineComment = 'Line 1\nLine 2\nLine 3'
      const commentWithUser = {
        ...mockComment,
        content: multilineComment,
        user: {
          id: mockUser.id,
          username: mockUser.username,
          avatar: mockUser.avatar,
        },
      }
      prismaMock.comment.create.mockResolvedValue(commentWithUser)

      const result = await createComment('post-123', multilineComment)

      expect(result.comment.content).toBe(multilineComment)
    })
  })

  describe('deleteComment', () => {
    it('should throw error when not authenticated', async () => {
      mockAuth.mockResolvedValue(mockNoSession)

      await expect(deleteComment('comment-123')).rejects.toThrow('Unauthorized')
    })

    it('should throw error when comment not found', async () => {
      mockAuth.mockResolvedValue(mockSession)
      prismaMock.comment.findUnique.mockResolvedValue(null)

      await expect(deleteComment('nonexistent-comment-id')).rejects.toThrow(
        'Comment not found'
      )
    })

    it('should prevent deleting another user\'s comment', async () => {
      mockAuth.mockResolvedValue(mockSession)
      const otherUserComment = {
        ...mockComment,
        userId: 'other-user-id', // Different user
      }
      prismaMock.comment.findUnique.mockResolvedValue(otherUserComment)

      await expect(deleteComment('comment-123')).rejects.toThrow(
        'You can only delete your own comments'
      )
      expect(prismaMock.comment.delete).not.toHaveBeenCalled()
    })

    it('should allow deleting own comment', async () => {
      mockAuth.mockResolvedValue(mockSession)
      const ownComment = {
        ...mockComment,
        userId: mockSession.user.id, // Same user
      }
      prismaMock.comment.findUnique.mockResolvedValue(ownComment)
      prismaMock.comment.delete.mockResolvedValue(ownComment)

      const result = await deleteComment('comment-123')

      expect(result.success).toBe(true)
      expect(prismaMock.comment.findUnique).toHaveBeenCalledWith({
        where: { id: 'comment-123' },
      })
      expect(prismaMock.comment.delete).toHaveBeenCalledWith({
        where: { id: 'comment-123' },
      })
    })

    it('should verify userId matches session.user.id exactly', async () => {
      mockAuth.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, id: 'specific-user-id' },
      })
      const ownComment = {
        ...mockComment,
        userId: 'specific-user-id',
      }
      prismaMock.comment.findUnique.mockResolvedValue(ownComment)
      prismaMock.comment.delete.mockResolvedValue(ownComment)

      await deleteComment('comment-123')

      // Should succeed because userId matches
      expect(prismaMock.comment.delete).toHaveBeenCalled()
    })
  })
})

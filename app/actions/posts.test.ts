import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prismaMock } from '@/__tests__/mocks/prisma'
import { mockAuth, mockSession, mockNoSession } from '@/__tests__/mocks/next-auth'
import { mockPost } from '@/__tests__/fixtures/data'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  default: prismaMock,
}))

vi.mock('@/lib/auth', () => ({
  auth: mockAuth,
}))

// Mock S3 module
const mockGetUploadUrl = vi.fn()
vi.mock('@/lib/s3', () => ({
  getUploadUrl: mockGetUploadUrl,
}))

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Import after mocks are set up
const { getPresignedUrl, createPost } = await import('./posts')

describe('Posts Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPresignedUrl', () => {
    it('should throw error when not authenticated', async () => {
      mockAuth.mockResolvedValue(mockNoSession)

      await expect(
        getPresignedUrl('test-image.jpg', 'image/jpeg')
      ).rejects.toThrow('Unauthorized')
    })

    it('should generate presigned URL with correct S3 parameters', async () => {
      mockAuth.mockResolvedValue(mockSession)
      const mockS3Response = {
        uploadUrl: 'https://bucket.s3.amazonaws.com/presigned-url',
        publicUrl: 'https://bucket.s3.amazonaws.com/posts/123-test-image.jpg',
        key: 'posts/123-test-image.jpg',
      }
      mockGetUploadUrl.mockResolvedValue(mockS3Response)

      const result = await getPresignedUrl('test-image.jpg', 'image/jpeg')

      expect(result).toEqual(mockS3Response)
      expect(mockGetUploadUrl).toHaveBeenCalledWith('test-image.jpg', 'image/jpeg')
    })

    it('should handle different file types', async () => {
      mockAuth.mockResolvedValue(mockSession)
      const mockS3Response = {
        uploadUrl: 'https://bucket.s3.amazonaws.com/presigned-url',
        publicUrl: 'https://bucket.s3.amazonaws.com/posts/456-photo.png',
        key: 'posts/456-photo.png',
      }
      mockGetUploadUrl.mockResolvedValue(mockS3Response)

      await getPresignedUrl('photo.png', 'image/png')

      expect(mockGetUploadUrl).toHaveBeenCalledWith('photo.png', 'image/png')
    })
  })

  describe('createPost', () => {
    it('should throw error when not authenticated', async () => {
      mockAuth.mockResolvedValue(mockNoSession)

      await expect(
        createPost({
          imageUrl: 'https://bucket.s3.amazonaws.com/posts/123.jpg',
          caption: 'Test caption',
        })
      ).rejects.toThrow('Unauthorized')
    })

    it('should create post with caption', async () => {
      mockAuth.mockResolvedValue(mockSession)
      const newPost = {
        ...mockPost,
        caption: 'Beautiful sunset!',
      }
      prismaMock.post.create.mockResolvedValue(newPost)

      const result = await createPost({
        imageUrl: mockPost.imageUrl,
        caption: 'Beautiful sunset!',
      })

      expect(result).toEqual(newPost)
      expect(prismaMock.post.create).toHaveBeenCalledWith({
        data: {
          imageUrl: mockPost.imageUrl,
          caption: 'Beautiful sunset!',
          userId: mockSession.user.id,
        },
      })
    })

    it('should create post without caption (optional field)', async () => {
      mockAuth.mockResolvedValue(mockSession)
      const newPost = {
        ...mockPost,
        caption: null,
      }
      prismaMock.post.create.mockResolvedValue(newPost)

      const result = await createPost({
        imageUrl: mockPost.imageUrl,
      })

      expect(result).toEqual(newPost)
      expect(prismaMock.post.create).toHaveBeenCalledWith({
        data: {
          imageUrl: mockPost.imageUrl,
          caption: undefined, // Caption is optional
          userId: mockSession.user.id,
        },
      })
    })

    it('should associate post with authenticated user', async () => {
      mockAuth.mockResolvedValue({
        ...mockSession,
        user: {
          ...mockSession.user,
          id: 'different-user-id',
        },
      })
      const newPost = {
        ...mockPost,
        userId: 'different-user-id',
      }
      prismaMock.post.create.mockResolvedValue(newPost)

      await createPost({
        imageUrl: mockPost.imageUrl,
        caption: 'Test',
      })

      expect(prismaMock.post.create).toHaveBeenCalledWith({
        data: {
          imageUrl: mockPost.imageUrl,
          caption: 'Test',
          userId: 'different-user-id',
        },
      })
    })
  })
})

// Reusable test data
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
  password: '$2a$10$hashedpassword', // Mocked bcrypt hash
  avatar: null,
  bio: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

export const mockPost = {
  id: 'post-123',
  imageUrl: 'https://bucket.s3.amazonaws.com/posts/123.jpg',
  caption: 'Test caption',
  userId: 'user-123',
  createdAt: new Date('2024-01-01'),
}

export const mockComment = {
  id: 'comment-123',
  content: 'Great post!',
  userId: 'user-123',
  postId: 'post-123',
  createdAt: new Date('2024-01-01'),
}

export const mockLike = {
  id: 'like-123',
  userId: 'user-123',
  postId: 'post-123',
  createdAt: new Date('2024-01-01'),
}

export const mockFollow = {
  id: 'follow-123',
  followerId: 'user-123',
  followingId: 'user-456',
  createdAt: new Date('2024-01-01'),
}

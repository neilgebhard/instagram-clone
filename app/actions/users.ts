'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function getUserProfileByUsername(username: string) {
  const session = await auth()
  const userId = session?.user?.id

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      avatar: true,
      bio: true,
      createdAt: true,
      posts: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          imageUrl: true,
          caption: true,
          createdAt: true,
          likes: {
            select: {
              id: true,
              userId: true,
            },
          },
        },
      },
    },
  })

  if (!user) {
    notFound()
  }

  return {
    ...user,
    _count: {
      posts: user.posts.length,
    },
    posts: user.posts.map((post) => ({
      id: post.id,
      imageUrl: post.imageUrl,
      caption: post.caption,
      createdAt: post.createdAt,
      _count: {
        likes: post.likes.length,
      },
      likes: userId ? post.likes.filter((like) => like.userId === userId) : [],
    })),
  }
}

export async function checkIsOwnProfile(username: string) {
  const session = await auth()
  if (!session?.user?.id) return false

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  })

  return user?.id === session.user.id
}

export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      email: true,
      bio: true,
    },
  })

  return user
}

type UpdateProfileData = {
  username: string
  email: string
  bio: string | null
}

export async function updateUserProfile(data: UpdateProfileData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized', field: 'general' }
  }

  // Sanitize inputs
  const username = data.username.trim()
  const email = data.email.trim()
  const bio = data.bio?.trim() || null

  // Validate required fields
  if (!username || !email) {
    return {
      success: false,
      error: 'Username and email are required',
      field: 'general',
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Invalid email format', field: 'email' }
  }

  // Validate username format (alphanumeric and underscore, 3-30 chars)
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/
  if (!usernameRegex.test(username)) {
    return {
      success: false,
      error: 'Username must be 3-30 characters (letters, numbers, underscores)',
      field: 'username',
    }
  }

  // Validate bio length
  if (bio && bio.length > 150) {
    return {
      success: false,
      error: 'Bio must be 150 characters or less',
      field: 'bio',
    }
  }

  try {
    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { username: true, email: true },
    })

    if (!currentUser) {
      return { success: false, error: 'User not found', field: 'general' }
    }

    // Check username uniqueness if changed
    if (username !== currentUser.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      })

      if (existingUser) {
        return {
          success: false,
          error: 'Username is already taken',
          field: 'username',
        }
      }
    }

    // Check email uniqueness if changed
    if (email !== currentUser.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      })

      if (existingEmail) {
        return {
          success: false,
          error: 'Email is already in use',
          field: 'email',
        }
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username,
        email,
        bio,
      },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
      },
    })

    // Revalidate cache
    revalidatePath('/', 'layout')

    return { success: true, user: updatedUser }
  } catch (error) {
    console.error('Update profile error:', error)
    return {
      success: false,
      error: 'Failed to update profile',
      field: 'general',
    }
  }
}

'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { notFound } from 'next/navigation'

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

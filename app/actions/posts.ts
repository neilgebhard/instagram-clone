'use server'

import { getUploadUrl } from '@/lib/s3'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getPresignedUrl(filename: string, contentType: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  return await getUploadUrl(filename, contentType)
}

export async function createPost(data: { imageUrl: string; caption?: string }) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const post = await prisma.post.create({
    data: {
      imageUrl: data.imageUrl,
      caption: data.caption,
      userId: session.user.id,
    },
  })

  revalidatePath('/', 'layout')
  return post
}

export async function getPosts() {
  const session = await auth()
  const userId = session?.user?.id

  const posts = await prisma.post.findMany({
    take: 20,
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      imageUrl: true,
      caption: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      likes: {
        select: {
          id: true,
          userId: true,
        },
      },
    },
  })

  return posts.map((post) => ({
    id: post.id,
    imageUrl: post.imageUrl,
    caption: post.caption,
    createdAt: post.createdAt,
    user: post.user,
    _count: {
      likes: post.likes.length,
    },
    likes: userId ? post.likes.filter((like) => like.userId === userId) : [],
  }))
}

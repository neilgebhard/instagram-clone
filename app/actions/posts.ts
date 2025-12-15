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

export async function deletePost(postId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
  })

  if (!post) {
    throw new Error('Post not found')
  }

  if (post.userId !== session.user.id) {
    throw new Error('You can only delete your own posts')
  }

  await prisma.post.delete({
    where: { id: postId },
  })

  revalidatePath('/', 'layout')
  return { success: true }
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
      comments: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          userId: true,
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
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
      comments: post.comments.length,
    },
    likes: userId ? post.likes.filter((like) => like.userId === userId) : [],
    comments: post.comments,
  }))
}

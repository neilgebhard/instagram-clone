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

  revalidatePath('/profile')
  revalidatePath('/')
  return post
}

export async function getPosts() {
  const posts = await prisma.post.findMany({
    take: 20,
    orderBy: {
      createdAt: 'desc',
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

  return posts
}

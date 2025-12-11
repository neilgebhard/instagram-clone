'use server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function toggleLike(postId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId: session.user.id,
        postId: postId,
      },
    },
  })

  if (existingLike) {
    await prisma.like.delete({
      where: {
        id: existingLike.id,
      },
    })
  } else {
    await prisma.like.create({
      data: {
        userId: session.user.id,
        postId: postId,
      },
    })
  }

  revalidatePath('/', 'layout')

  return { success: true, liked: !existingLike }
}

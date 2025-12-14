'use server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createComment(postId: string, content: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  if (!content.trim()) {
    throw new Error('Comment cannot be empty')
  }

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      userId: session.user.id,
      postId: postId,
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

  revalidatePath('/', 'layout')

  return { success: true, comment }
}

export async function deleteComment(commentId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  })

  if (!comment) {
    throw new Error('Comment not found')
  }

  if (comment.userId !== session.user.id) {
    throw new Error('You can only delete your own comments')
  }

  await prisma.comment.delete({
    where: { id: commentId },
  })

  revalidatePath('/', 'layout')

  return { success: true }
}

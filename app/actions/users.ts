'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { notFound } from 'next/navigation'

export async function getUserProfileByUsername(username: string) {
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
        },
      },
      _count: {
        select: {
          posts: true,
        },
      },
    },
  })

  if (!user) {
    notFound()
  }

  return user
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

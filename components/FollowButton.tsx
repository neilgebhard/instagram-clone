'use client'

import { useState, useTransition } from 'react'
import { toggleFollow } from '@/app/actions/follows'

type FollowButtonProps = {
  targetUserId: string
  initialFollowing: boolean
}

export default function FollowButton({
  targetUserId,
  initialFollowing,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [isPending, startTransition] = useTransition()

  function handleFollow() {
    const wasFollowing = following
    setFollowing(!following) // Optimistic update

    startTransition(async () => {
      try {
        await toggleFollow(targetUserId)
      } catch (error) {
        setFollowing(wasFollowing) // Rollback on error
        console.error('Failed to toggle follow:', error)
      }
    })
  }

  return (
    <button
      onClick={handleFollow}
      disabled={isPending}
      className={`px-4 py-1.5 text-sm font-semibold rounded-lg cursor-pointer transition-colors disabled:opacity-50 ${
        following
          ? 'bg-gray-100 hover:bg-gray-200 text-black'
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      }`}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  )
}

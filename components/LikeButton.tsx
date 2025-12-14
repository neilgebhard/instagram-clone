'use client'

import { useState, useTransition } from 'react'
import { toggleLike } from '@/app/actions/likes'

type LikeButtonProps = {
  postId: string
  initialLiked: boolean
  initialLikeCount: number
}

export default function LikeButton({
  postId,
  initialLiked,
  initialLikeCount,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isPending, startTransition] = useTransition()

  function handleLike() {
    const wasLiked = liked
    const previousCount = likeCount
    const newLiked = !liked
    const newCount = newLiked ? likeCount + 1 : likeCount - 1

    setLiked(newLiked)
    setLikeCount(newCount)

    startTransition(async () => {
      try {
        await toggleLike(postId)
      } catch (error) {
        setLiked(wasLiked)
        setLikeCount(previousCount)
        console.error('Failed to toggle like:', error)
      }
    })
  }

  return (
    <div className='space-y-2'>
      <button
        onClick={handleLike}
        disabled={isPending}
        aria-label={liked ? 'Unlike post' : 'Like post'}
        className='hover:opacity-60 transition-opacity cursor-pointer disabled:opacity-50'
      >
        {liked ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#ed4956">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        )}
      </button>
      {likeCount > 0 && (
        <p className='text-sm font-semibold'>
          {likeCount} {likeCount === 1 ? 'like' : 'likes'}
        </p>
      )}
    </div>
  )
}

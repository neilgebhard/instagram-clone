'use client'

import { useState, useTransition } from 'react'
import { toggleLike } from '@/app/actions/likes'
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai'

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
    <div className='flex items-center gap-3'>
      <button
        onClick={handleLike}
        disabled={isPending}
        aria-label={liked ? 'Unlike post' : 'Like post'}
        className='hover:opacity-60 transition-opacity cursor-pointer disabled:opacity-50'
      >
        {liked ? (
          <AiFillHeart className='text-3xl text-red-500' />
        ) : (
          <AiOutlineHeart className='text-3xl' />
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

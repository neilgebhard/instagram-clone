'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BsThreeDots, BsTrash } from 'react-icons/bs'
import LikeButton from './LikeButton'
import CommentSection from './CommentSection'
import { deletePost } from '@/app/actions/posts'

type PostCardProps = {
  post: {
    id: string
    imageUrl: string
    caption: string | null
    createdAt: Date
    user: {
      id: string
      username: string
      avatar: string | null
    }
    _count: {
      likes: number
      comments: number
    }
    likes: Array<{ id: string }>
    comments: Array<{
      id: string
      content: string
      createdAt: Date
      userId: string
      user: {
        id: string
        username: string
        avatar: string | null
      }
    }>
  }
  currentUserId?: string
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const [isDeleted, setIsDeleted] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isPending, startTransition] = useTransition()

  const isOwner = currentUserId === post.user.id
  const isLiked = post.likes.length > 0
  const likeCount = post._count.likes

  function handleDelete() {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    setIsDeleted(true)
    setShowMenu(false)

    startTransition(async () => {
      try {
        await deletePost(post.id)
      } catch (error) {
        console.error('Failed to delete post:', error)
        setIsDeleted(false)
        alert('Failed to delete post. Please try again.')
      }
    })
  }

  if (isDeleted) {
    return null
  }

  return (
    <article className='bg-white border border-gray-300 rounded-sm'>
      {/* Post Header */}
      <div className='flex items-center justify-between px-4 py-3'>
        <Link href={`/${post.user.username}`} className='flex items-center gap-3 hover:opacity-70'>
          {post.user.avatar ? (
            <Image
              src={post.user.avatar}
              alt={post.user.username}
              width={32}
              height={32}
              className='rounded-full'
            />
          ) : (
            <div className='w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center'>
              <span className='text-gray-600 font-semibold text-sm'>
                {post.user.username[0].toUpperCase()}
              </span>
            </div>
          )}
          <span className='font-semibold text-sm'>{post.user.username}</span>
        </Link>

        {isOwner && (
          <div className='relative'>
            <button
              onClick={() => setShowMenu(!showMenu)}
              aria-label='Post options'
              className='p-2 hover:bg-gray-100 rounded-full transition-colors'
            >
              <BsThreeDots className='text-xl' />
            </button>

            {showMenu && (
              <>
                <div className='fixed inset-0 z-10' onClick={() => setShowMenu(false)} />
                <div className='absolute right-0 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-md z-20 overflow-hidden'>
                  <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className='w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 cursor-pointer whitespace-nowrap'
                  >
                    <BsTrash className='text-base' />
                    Delete Post
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Post Image */}
      <div className='relative w-full aspect-square bg-gray-100'>
        <Image
          src={post.imageUrl}
          alt={post.caption || 'Post image'}
          fill
          className='object-cover'
        />
      </div>

      {/* Like Button */}
      <div className='px-4 py-3'>
        <LikeButton postId={post.id} initialLiked={isLiked} initialLikeCount={likeCount} />
      </div>

      {/* Caption and Timestamp */}
      <div className='px-4 pb-3'>
        {post.caption && (
          <p className='text-sm mb-2'>
            <Link href={`/${post.user.username}`} className='font-semibold hover:opacity-70 mr-2'>
              {post.user.username}
            </Link>
            <span>{post.caption}</span>
          </p>
        )}
        <time className='text-xs text-gray-500 uppercase'>
          {new Date(post.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </time>
      </div>

      {/* Comments Section */}
      <CommentSection
        postId={post.id}
        initialComments={post.comments}
        currentUserId={currentUserId}
      />
    </article>
  )
}

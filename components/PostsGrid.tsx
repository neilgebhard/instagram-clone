'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { BsTrash } from 'react-icons/bs'
import { deletePost } from '@/app/actions/posts'

type PostsGridProps = {
  posts: {
    id: string
    imageUrl: string
    caption: string | null
    createdAt: Date
  }[]
  isOwnProfile?: boolean
}

export default function PostsGrid({ posts, isOwnProfile }: PostsGridProps) {
  const [deletedPosts, setDeletedPosts] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  function handleDelete(postId: string, event: React.MouseEvent) {
    event.stopPropagation()

    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    setDeletedPosts((prev) => new Set([...prev, postId]))

    startTransition(async () => {
      try {
        await deletePost(postId)
      } catch (error) {
        console.error('Failed to delete post:', error)
        setDeletedPosts((prev) => {
          const next = new Set(prev)
          next.delete(postId)
          return next
        })
        alert('Failed to delete post. Please try again.')
      }
    })
  }

  const visiblePosts = posts.filter((post) => !deletedPosts.has(post.id))

  if (visiblePosts.length === 0) {
    return (
      <div className='bg-gray-50 py-20'>
        <div className='text-center'>
          <div className='w-16 h-16 mx-auto mb-4 rounded-full border-2 border-gray-800 flex items-center justify-center'>
            <svg
              className='w-8 h-8'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 13a3 3 0 11-6 0 3 3 0 016 0z'
              />
            </svg>
          </div>
          <p className='text-3xl font-light mb-2'>No Posts Yet</p>
          <p className='text-gray-500'>When you share photos, they will appear on your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-gray-50'>
      <div className='max-w-4xl mx-auto'>
        <div className='grid grid-cols-3 gap-1'>
          {visiblePosts.map((post) => (
            <div
              key={post.id}
              className='relative aspect-square bg-gray-100 overflow-hidden group'
            >
              <Image
                src={post.imageUrl}
                alt={post.caption || 'Post image'}
                fill
                className='object-cover'
              />

              {isOwnProfile && (
                <>
                  <div className='absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none' />
                  <button
                    onClick={(e) => handleDelete(post.id, e)}
                    disabled={isPending}
                    aria-label='Delete post'
                    className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white p-3 rounded-full disabled:opacity-50 cursor-pointer z-10'
                  >
                    <BsTrash className='text-xl' />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

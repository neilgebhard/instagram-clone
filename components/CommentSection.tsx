'use client'

import { useState, useTransition } from 'react'
import { createComment, deleteComment } from '@/app/actions/comments'
import Link from 'next/link'

type Comment = {
  id: string
  content: string
  createdAt: Date
  userId: string
  user: {
    id: string
    username: string
    avatar: string | null
  }
}

type CommentSectionProps = {
  postId: string
  initialComments: Comment[]
  currentUserId?: string
}

export default function CommentSection({
  postId,
  initialComments,
  currentUserId,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim() || !currentUserId) return

    const commentContent = newComment.trim()
    setNewComment('')

    startTransition(async () => {
      try {
        const result = await createComment(postId, commentContent)
        if (result.success && result.comment) {
          setComments([...comments, result.comment as Comment])
        }
      } catch (error) {
        console.error('Failed to create comment:', error)
        setNewComment(commentContent)
      }
    })
  }

  function handleDelete(commentId: string) {
    const previousComments = comments
    setComments(comments.filter((c) => c.id !== commentId))

    startTransition(async () => {
      try {
        await deleteComment(commentId)
      } catch (error) {
        console.error('Failed to delete comment:', error)
        setComments(previousComments)
      }
    })
  }

  function getRelativeTime(date: Date) {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`
    return `${Math.floor(diffInSeconds / 604800)}w`
  }

  return (
    <div className='border-t border-gray-300'>
      {comments.length > 0 && (
        <div className='px-4 py-2 space-y-2'>
          {comments.map((comment) => (
            <div key={comment.id} className='flex items-start justify-between gap-2'>
              <div className='flex-1 text-sm'>
                <Link
                  href={`/${comment.user.username}`}
                  className='font-semibold hover:opacity-70 mr-2'
                >
                  {comment.user.username}
                </Link>
                <span>{comment.content}</span>
                <div className='text-xs text-gray-500 mt-1'>
                  {getRelativeTime(comment.createdAt)}
                </div>
              </div>
              {currentUserId && comment.userId === currentUserId && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={isPending}
                  aria-label="Delete comment"
                  className='text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer disabled:opacity-50'
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {currentUserId && (
        <form onSubmit={handleSubmit} className='px-4 py-3 flex items-center gap-2'>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            disabled={isPending}
            className='flex-1 text-sm outline-none disabled:opacity-50'
          />
          <button
            type="submit"
            disabled={isPending || !newComment.trim()}
            className='text-sm font-semibold text-blue-500 hover:text-blue-700 disabled:opacity-30 cursor-pointer'
          >
            Post
          </button>
        </form>
      )}
    </div>
  )
}

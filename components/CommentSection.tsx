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
    <div>
      {comments.length > 0 && (
        <div>
          {comments.map((comment) => (
            <div key={comment.id}>
              <div>
                <Link href={`/${comment.user.username}`}>
                  {comment.user.username}
                </Link>{' '}
                <span>{comment.content}</span>
                <div>
                  {getRelativeTime(comment.createdAt)}
                </div>
              </div>
              {currentUserId && comment.userId === currentUserId && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={isPending}
                  aria-label="Delete comment"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {currentUserId && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            disabled={isPending}
          />
          <button
            type="submit"
            disabled={isPending || !newComment.trim()}
          >
            Post
          </button>
        </form>
      )}
    </div>
  )
}

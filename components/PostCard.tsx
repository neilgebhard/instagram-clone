import Image from 'next/image'
import Link from 'next/link'
import LikeButton from './LikeButton'
import CommentSection from './CommentSection'

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
  const isLiked = post.likes.length > 0
  const likeCount = post._count.likes

  return (
    <div>
      <div>
        <Link href={`/${post.user.username}`}>{post.user.username}</Link>
      </div>

      <div>
        <Image
          src={post.imageUrl}
          alt={post.caption || 'Post image'}
          width={500}
          height={500}
        />
      </div>

      <LikeButton postId={post.id} initialLiked={isLiked} initialLikeCount={likeCount} />

      <div>
        {post.caption && (
          <p>
            <Link href={`/${post.user.username}`}>{post.user.username}</Link>
            {post.caption}
          </p>
        )}
        <time>
          {new Date(post.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </time>
      </div>

      <CommentSection
        postId={post.id}
        initialComments={post.comments}
        currentUserId={currentUserId}
      />
    </div>
  )
}

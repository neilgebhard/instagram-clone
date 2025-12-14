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
    <article className='bg-white border border-gray-300 rounded-sm'>
      {/* Post Header */}
      <div className='flex items-center gap-3 px-4 py-3'>
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

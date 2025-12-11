import Image from 'next/image'

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
  }
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <div>
      <div>
        <span>{post.user.username}</span>
      </div>

      <div>
        <Image
          src={post.imageUrl}
          alt={post.caption || 'Post image'}
          width={500}
          height={500}
        />
      </div>

      <div>
        {post.caption && (
          <p>
            <span>{post.user.username}</span>
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
    </div>
  )
}

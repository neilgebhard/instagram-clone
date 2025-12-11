import Image from 'next/image'

type PostsGridProps = {
  posts: {
    id: string
    imageUrl: string
    caption: string | null
    createdAt: Date
  }[]
}

export default function PostsGrid({ posts }: PostsGridProps) {
  if (posts.length === 0) {
    return (
      <div>
        <p>No posts yet</p>
      </div>
    )
  }

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id}>
          <Image
            src={post.imageUrl}
            alt={post.caption || 'Post image'}
            width={300}
            height={300}
          />
        </div>
      ))}
    </div>
  )
}

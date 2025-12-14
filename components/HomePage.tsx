import { getPosts } from '@/app/actions/posts'
import { auth } from '@/lib/auth'
import PostCard from './PostCard'
import SignOutButton from './SignOutButton'
import Link from 'next/link'

export default async function HomePage() {
  const posts = await getPosts()
  const session = await auth()
  const currentUserId = session?.user?.id

  return (
    <div>
      <header>
        <h1>Instagram Clone</h1>
        <div>
          <Link href='/create'>Create Post</Link>
          <SignOutButton />
        </div>
      </header>

      <main>
        {posts.length === 0 ? (
          <div>
            <p>No posts yet</p>
            <Link href='/create'>Create the first post</Link>
          </div>
        ) : (
          <div>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={currentUserId} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

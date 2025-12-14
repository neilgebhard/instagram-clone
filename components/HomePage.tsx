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
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white border-b border-gray-300 sticky top-0 z-50'>
        <div className='max-w-5xl mx-auto px-4 h-16 flex items-center justify-between'>
          <h1 className='text-2xl font-bold font-serif italic'>Instagram</h1>
          <div className='flex items-center gap-4'>
            <Link
              href='/create'
              className='text-sm font-semibold text-blue-500 hover:text-blue-600 cursor-pointer'
            >
              Create Post
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className='max-w-2xl mx-auto py-8 px-4'>
        {posts.length === 0 ? (
          <div className='bg-white border border-gray-300 rounded-sm p-12 text-center'>
            <p className='text-gray-500 mb-4 text-lg'>No posts yet</p>
            <Link
              href='/create'
              className='inline-block px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 cursor-pointer'
            >
              Create the first post
            </Link>
          </div>
        ) : (
          <div className='space-y-6'>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={currentUserId} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

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
          {posts.map((post) => (
            <div key={post.id} className='relative aspect-square bg-gray-100 overflow-hidden group cursor-pointer'>
              <Image
                src={post.imageUrl}
                alt={post.caption || 'Post image'}
                fill
                className='object-cover group-hover:opacity-90 transition-opacity'
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

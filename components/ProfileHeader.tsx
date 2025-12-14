import Image from 'next/image'
import EditProfileButton from './EditProfileButton'

type ProfileHeaderProps = {
  user: {
    id: string
    username: string
    avatar: string | null
    bio: string | null
    createdAt: Date
    _count: {
      posts: number
    }
  }
  isOwnProfile: boolean
}

export default function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
  return (
    <div className='bg-white border-b border-gray-300'>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        <div className='flex flex-col md:flex-row gap-8 md:gap-12'>
          {/* Avatar */}
          <div className='flex justify-center md:justify-start'>
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.username}
                width={150}
                height={150}
                className='rounded-full'
              />
            ) : (
              <div className='w-[150px] h-[150px] rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center'>
                <span className='text-white text-6xl font-bold'>
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className='flex-1 space-y-6'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4'>
              <h1 className='text-xl font-light'>{user.username}</h1>
              {isOwnProfile && <EditProfileButton />}
            </div>

            <div className='flex gap-8'>
              <div>
                <span className='font-semibold'>{user._count.posts}</span>{' '}
                <span className='text-gray-600'>posts</span>
              </div>
            </div>

            {user.bio && (
              <div>
                <p className='text-sm whitespace-pre-wrap'>{user.bio}</p>
              </div>
            )}

            <p className='text-xs text-gray-500'>
              Joined{' '}
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

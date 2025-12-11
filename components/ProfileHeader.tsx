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
    <div>
      <div>
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={user.username}
            width={150}
            height={150}
          />
        ) : (
          <div>
            <span>{user.username.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>

      <div>
        <div>
          <h1>{user.username}</h1>
          {isOwnProfile && <EditProfileButton />}
        </div>

        <div>
          <span>{user._count.posts} posts</span>
        </div>

        {user.bio && <p>{user.bio}</p>}

        <p>
          Joined {new Date(user.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>
    </div>
  )
}

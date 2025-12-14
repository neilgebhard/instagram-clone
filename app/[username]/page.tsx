import { getUserProfileByUsername, checkIsOwnProfile } from '@/app/actions/users'
import ProfileHeader from '@/components/ProfileHeader'
import PostsGrid from '@/components/PostsGrid'

type Props = {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params
  const userProfile = await getUserProfileByUsername(username)
  const isOwnProfile = await checkIsOwnProfile(username)

  return (
    <div className='bg-gray-50 min-h-screen'>
      <ProfileHeader user={userProfile} isOwnProfile={isOwnProfile} />
      <div className='pt-12'>
        <PostsGrid posts={userProfile.posts} />
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params
  return {
    title: `${username} - Instagram Clone`,
  }
}

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
    <div>
      <ProfileHeader user={userProfile} isOwnProfile={isOwnProfile} />
      <PostsGrid posts={userProfile.posts} />
    </div>
  )
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params
  return {
    title: `${username} - Instagram Clone`,
  }
}

'use client'

import { useRouter } from 'next/navigation'

export default function EditProfileButton() {
  const router = useRouter()

  return (
    <button onClick={() => router.push('/edit-profile')}>
      Edit Profile
    </button>
  )
}

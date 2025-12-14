'use client'

import { useRouter } from 'next/navigation'

export default function EditProfileButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/edit-profile')}
      className='px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-sm font-semibold rounded-lg cursor-pointer transition-colors'
    >
      Edit Profile
    </button>
  )
}

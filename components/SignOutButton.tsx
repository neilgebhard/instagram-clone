'use client'

import { signOut } from 'next-auth/react'

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className='text-sm font-semibold text-gray-700 hover:text-gray-900 cursor-pointer'
    >
      Sign out
    </button>
  )
}

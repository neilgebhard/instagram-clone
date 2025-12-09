'use client'

import { signOut, useSession } from 'next-auth/react'

export default function HomePage() {
  const { data: session } = useSession()

  return (
    <div>
      <h1>Welcome to Instagram Clone</h1>
      <p>Hello, {session?.user?.email}</p>

      {/* Add your actual app content here */}
      <div>
        <h2>Your Feed</h2>
        <p>This is where your Instagram clone app content will go</p>
      </div>

      <button onClick={() => signOut()}>Sign out</button>
    </div>
  )
}

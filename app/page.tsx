'use client'

import { useSession } from 'next-auth/react'
import LoginForm from '@/components/LoginForm'
import HomePage from '@/components/HomePage'

export default function Home() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (session) {
    return <HomePage />
  }

  return <LoginForm />
}

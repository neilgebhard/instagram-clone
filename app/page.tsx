import { auth } from '@/lib/auth'
import LoginForm from '@/components/LoginForm'
import HomePage from '@/components/HomePage'

export default async function Home() {
  const session = await auth()

  if (session) {
    return <HomePage />
  }

  return <LoginForm />
}

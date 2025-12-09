'use client'

import { useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/')
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (session) {
    return (
      <div>
        <h1>Welcome back, {session.user?.email}</h1>
        <p>You are logged in!</p>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    )
  }

  return (
    <div>
      <h1>Sign in to your account</h1>
      <p>
        Don&apost have an account? <Link href='/signup'>Sign up</Link>
      </p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor='email'>Email address</label>
          <input
            id='email'
            name='email'
            type='email'
            required
            value={formData.email}
            onChange={handleChange}
            placeholder='Email address'
          />
        </div>

        <div>
          <label htmlFor='password'>Password</label>
          <input
            id='password'
            name='password'
            type='password'
            required
            value={formData.password}
            onChange={handleChange}
            placeholder='Password'
          />
        </div>

        {error && <div>{error}</div>}

        <button type='submit' disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>

        <hr />
        <p>Or continue with</p>

        <button
          type='button'
          onClick={() => signIn('google', { callbackUrl: '/' })}
        >
          Google
        </button>

        <button
          type='button'
          onClick={() => signIn('github', { callbackUrl: '/' })}
        >
          GitHub
        </button>
      </form>
    </div>
  )
}

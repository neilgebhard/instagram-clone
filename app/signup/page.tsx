'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError(
          'Account created but failed to sign in. Please try signing in manually.'
        )
      } else {
        router.push('/')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
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

  return (
    <div>
      <h1>Create your account</h1>
      <p>
        Already have an account? <Link href='/auth/signin'>Sign in</Link>
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
          <label htmlFor='username'>Username</label>
          <input
            id='username'
            name='username'
            type='text'
            required
            value={formData.username}
            onChange={handleChange}
            placeholder='Username'
          />
        </div>

        <div>
          <label htmlFor='password'>Password</label>
          <input
            id='password'
            name='password'
            type='password'
            required
            minLength={8}
            value={formData.password}
            onChange={handleChange}
            placeholder='Password'
          />
        </div>

        {error && <div>{error}</div>}

        <button type='submit' disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Sign up'}
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

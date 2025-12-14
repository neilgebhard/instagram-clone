'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, updateUserProfile } from '@/app/actions/users'

type User = {
  id: string
  username: string
  email: string
  bio: string | null
}

export default function EditProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/signin')
        return
      }
      setUser(currentUser)
      setFormData({
        username: currentUser.username,
        email: currentUser.email,
        bio: currentUser.bio || '',
      })
      setLoading(false)
    }
    loadUser()
  }, [router])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    try {
      const result = await updateUserProfile({
        username: formData.username,
        email: formData.email,
        bio: formData.bio || null,
      })

      if (!result.success) {
        setErrors({ [result.field as string]: result.error as string })
        return
      }

      // Redirect to profile page with new username
      if (result.user) {
        router.push(`/${result.user.username}`)
      }
    } catch (error) {
      setErrors({ general: 'Failed to update profile' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div>
      <h1>Edit Profile</h1>

      <form onSubmit={handleSubmit}>
        {errors.general && <p>{errors.general}</p>}

        <div>
          <label>Username</label>
          <input
            type='text'
            name='username'
            value={formData.username}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={30}
          />
          {errors.username && <p>{errors.username}</p>}
        </div>

        <div>
          <label>Email</label>
          <input
            type='email'
            name='email'
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <p>{errors.email}</p>}
        </div>

        <div>
          <label>Bio</label>
          <textarea
            name='bio'
            value={formData.bio}
            onChange={handleChange}
            placeholder='Tell us about yourself...'
            rows={4}
            maxLength={150}
          />
          {errors.bio && <p>{errors.bio}</p>}
        </div>

        <button type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>

        <button
          type='button'
          onClick={() => router.push(`/${user.username}`)}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </form>
    </div>
  )
}

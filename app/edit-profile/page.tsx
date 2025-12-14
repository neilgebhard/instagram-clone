'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  getCurrentUser,
  updateUserProfile,
  getPresignedUrlForAvatar,
} from '@/app/actions/users'

type User = {
  id: string
  username: string
  email: string
  bio: string | null
  avatar: string | null
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
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

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

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    try {
      let avatarUrl: string | null | undefined = undefined

      // Upload avatar if new file selected
      if (avatarFile) {
        try {
          const { uploadUrl, publicUrl } = await getPresignedUrlForAvatar(
            avatarFile.name,
            avatarFile.type
          )

          await fetch(uploadUrl, {
            method: 'PUT',
            body: avatarFile,
            headers: {
              'Content-Type': avatarFile.type,
            },
          })

          avatarUrl = publicUrl
        } catch (error) {
          setErrors({ avatar: 'Failed to upload avatar. Please try again.' })
          return
        }
      }

      const result = await updateUserProfile({
        username: formData.username,
        email: formData.email,
        bio: formData.bio || null,
        avatar: avatarUrl,
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
          <label>Avatar</label>
          <div>
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt='Avatar preview'
                width={150}
                height={150}
              />
            ) : user.avatar ? (
              <Image
                src={user.avatar}
                alt='Current avatar'
                width={150}
                height={150}
              />
            ) : (
              <div>
                <span>{user.username.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          <input
            type='file'
            accept='image/*'
            onChange={handleAvatarChange}
          />
          {errors.avatar && <p>{errors.avatar}</p>}
        </div>

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

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
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
          <p className='mt-2 text-gray-600'>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <main className='max-w-2xl mx-auto py-8 px-4'>
        <form onSubmit={handleSubmit} className='bg-white border border-gray-300 rounded-sm'>
          {errors.general && (
            <div className='px-6 pt-6'>
              <p className='text-red-500 text-sm text-center bg-red-50 border border-red-200 rounded p-3'>
                {errors.general}
              </p>
            </div>
          )}

          <div className='p-6 space-y-6'>
            {/* Avatar Section */}
            <div className='flex items-center gap-6'>
              <div className='flex-shrink-0'>
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt='Avatar preview'
                    width={80}
                    height={80}
                    className='rounded-full'
                  />
                ) : user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt='Current avatar'
                    width={80}
                    height={80}
                    className='rounded-full'
                  />
                ) : (
                  <div className='w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center'>
                    <span className='text-white text-3xl font-bold'>
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className='flex-1'>
                <p className='font-semibold mb-2'>{user.username}</p>
                <label className='inline-block px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg cursor-pointer transition-colors'>
                  Change Photo
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleAvatarChange}
                    className='hidden'
                  />
                </label>
                {errors.avatar && (
                  <p className='text-red-500 text-sm mt-2'>{errors.avatar}</p>
                )}
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label htmlFor='username' className='block text-sm font-semibold mb-2'>
                Username
              </label>
              <input
                id='username'
                type='text'
                name='username'
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={30}
                className='w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm'
              />
              {errors.username && (
                <p className='text-red-500 text-sm mt-1'>{errors.username}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor='email' className='block text-sm font-semibold mb-2'>
                Email
              </label>
              <input
                id='email'
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm'
              />
              {errors.email && (
                <p className='text-red-500 text-sm mt-1'>{errors.email}</p>
              )}
            </div>

            {/* Bio Field */}
            <div>
              <label htmlFor='bio' className='block text-sm font-semibold mb-2'>
                Bio
              </label>
              <textarea
                id='bio'
                name='bio'
                value={formData.bio}
                onChange={handleChange}
                placeholder='Tell us about yourself...'
                rows={4}
                maxLength={150}
                className='w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm resize-none'
              />
              <p className='text-xs text-gray-500 mt-1'>
                {formData.bio.length}/150 characters
              </p>
              {errors.bio && (
                <p className='text-red-500 text-sm mt-1'>{errors.bio}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className='border-t border-gray-300 p-4 flex gap-3'>
            <button
              type='submit'
              disabled={isSubmitting}
              className='flex-1 py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>

            <button
              type='button'
              onClick={() => router.push(`/${user.username}`)}
              disabled={isSubmitting}
              className='flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors'
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

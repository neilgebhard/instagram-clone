// app/create/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getPresignedUrl, createPost } from '@/app/actions/posts'

export default function CreatePostPage() {
  const router = useRouter()
  const [caption, setCaption] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    try {
      // 1. Get presigned URL
      const { uploadUrl, publicUrl } = await getPresignedUrl(
        file.name,
        file.type
      )

      // 2. Upload to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      // 3. Save post to database
      await createPost({
        imageUrl: publicUrl,
        caption: caption || undefined,
      })

      router.push('/')
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload post')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white border-b border-gray-300 sticky top-0 z-50'>
        <div className='max-w-5xl mx-auto px-4 h-16 flex items-center justify-between'>
          <h1 className='text-xl font-semibold'>Create New Post</h1>
          <button
            onClick={() => router.push('/')}
            className='text-sm text-gray-600 hover:text-gray-900 cursor-pointer'
          >
            Cancel
          </button>
        </div>
      </header>

      <main className='max-w-2xl mx-auto py-8 px-4'>
        <form onSubmit={handleSubmit} className='bg-white border border-gray-300 rounded-sm overflow-hidden'>
          <div className='p-6 space-y-6'>
            {/* Image Upload Section */}
            <div>
              <label className='block text-sm font-semibold mb-3'>Image</label>
              {preview ? (
                <div className='space-y-4'>
                  <div className='relative w-full max-w-lg mx-auto aspect-square bg-gray-100 rounded-sm overflow-hidden'>
                    <img
                      src={preview}
                      alt='Preview'
                      className='w-full h-full object-cover'
                    />
                  </div>
                  <button
                    type='button'
                    onClick={() => {
                      setFile(null)
                      setPreview(null)
                    }}
                    className='w-full py-2 text-sm font-semibold text-red-500 hover:text-red-700 cursor-pointer'
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <label className='flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100'>
                  <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                    <svg
                      className='w-12 h-12 mb-4 text-gray-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 4v16m8-8H4'
                      />
                    </svg>
                    <p className='mb-2 text-sm text-gray-500 font-semibold'>
                      Click to upload an image
                    </p>
                    <p className='text-xs text-gray-400'>PNG, JPG, GIF up to 10MB</p>
                  </div>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleFileChange}
                    required
                    className='hidden'
                  />
                </label>
              )}
            </div>

            {/* Caption Section */}
            <div>
              <label htmlFor='caption' className='block text-sm font-semibold mb-3'>
                Caption
              </label>
              <textarea
                id='caption'
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder='Write a caption...'
                rows={4}
                className='w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm resize-none'
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className='border-t border-gray-300 p-4'>
            <button
              type='submit'
              disabled={uploading || !file}
              className='w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
            >
              {uploading ? 'Uploading...' : 'Share Post'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

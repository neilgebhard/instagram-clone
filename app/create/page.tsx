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
    <div>
      <h1>Create Post</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Image</label>
          <input
            type='file'
            accept='image/*'
            onChange={handleFileChange}
            required
          />
          {preview && <img src={preview} alt='Preview' />}
        </div>

        <div>
          <label>Caption</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder='Write a caption...'
            rows={3}
          />
        </div>

        <button type='submit' disabled={uploading || !file}>
          {uploading ? 'Uploading...' : 'Create Post'}
        </button>
      </form>
    </div>
  )
}

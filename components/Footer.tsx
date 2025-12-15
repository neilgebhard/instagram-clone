import Link from 'next/link'
import { auth } from '@/lib/auth'
import { AiFillGithub } from 'react-icons/ai'

export default async function Footer() {
  const session = await auth()

  // Don't show footer on login page (when not authenticated)
  if (!session) {
    return null
  }

  return (
    <footer className='mt-auto bg-gray-50'>
      <div className='max-w-5xl mx-auto px-4 py-6 flex items-center justify-center'>
        <Link
          href='https://github.com/neilgebhard/instagram-clone'
          target='_blank'
          rel='noopener noreferrer'
          className='text-gray-500 hover:text-gray-700 hover:scale-105 cursor-pointer transition-all'
          aria-label='View source on GitHub'
        >
          <AiFillGithub className='text-3xl' />
        </Link>
      </div>
    </footer>
  )
}

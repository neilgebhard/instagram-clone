import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AiFillInstagram, AiOutlinePlusCircle } from 'react-icons/ai'
import { CgProfile } from 'react-icons/cg'

export default async function Topbar() {
  const session = await auth()
  let username = null

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { username: true },
    })
    username = user?.username
  }

  console.log(session)

  return (
    <header className='bg-white border-b border-gray-300 sticky top-0 z-50'>
      <div className='max-w-5xl mx-auto px-4 h-16 flex items-center justify-between'>
        {/* Instagram icon - No hover effect */}
        <Link
          href='/'
          className='cursor-pointer'
          aria-label='Instagram Home'
        >
          <AiFillInstagram className='text-3xl' />
        </Link>

        {username && (
          <div className='flex items-center gap-2'>
            {/* Create Post - Background circle + scale */}
            <Link
              href='/create'
              className='text-gray-700 hover:bg-gray-100 hover:scale-105 cursor-pointer transition-all p-2 rounded-full'
              aria-label='Create Post'
            >
              <AiOutlinePlusCircle className='text-3xl' />
            </Link>

            {/* Profile - Background circle + scale */}
            <Link
              href={`/${username}`}
              className='text-gray-700 hover:bg-gray-100 hover:scale-105 cursor-pointer transition-all p-2 rounded-full'
              aria-label='Profile'
            >
              <CgProfile className='text-3xl' />
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

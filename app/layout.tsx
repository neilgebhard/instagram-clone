import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import Topbar from '@/components/Topbar'

export const metadata: Metadata = {
  title: 'Instagram Clone',
  description: 'A clone of Instagram',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body>
        <Providers>
          <Topbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}

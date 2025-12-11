import Link from 'next/link'

export default function NotFound() {
  return (
    <div>
      <h2>User Not Found</h2>
      <p>Sorry, this page isn't available.</p>
      <Link href="/">Go back home</Link>
    </div>
  )
}

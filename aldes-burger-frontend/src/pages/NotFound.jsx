import { Home, Sandwich } from 'lucide-react'
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-orange-50 px-4">
      <section className="w-full max-w-xl rounded-3xl bg-white p-8 text-center shadow-md">
        <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
          <Sandwich className="h-8 w-8" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">404 - Patty Not Found</p>
        <h1 className="mt-2 text-3xl font-black text-gray-800">Oops! This burger page got grilled.</h1>
        <p className="mt-3 text-gray-600">Looks like the page melted like cheese on a hot bun. Let&apos;s get you back to the main menu.</p>

        <Link to="/" className="mx-auto mt-6 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600">
          <Home className="h-4 w-4" /> Back to Home
        </Link>
      </section>
    </main>
  )
}

export default NotFound

import { LockKeyhole, Mail, UtensilsCrossed } from 'lucide-react'
import { Link } from 'react-router-dom'

function Auth() {
  const handleSubmit = (event) => {
    event.preventDefault()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-aldesCream px-4 py-10">
      <section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-md sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <UtensilsCrossed className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Welcome back, Burger Lover</h1>
          <p className="mt-2 text-sm text-gray-500">Sign in and continue your delicious order journey.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700"><Mail className="h-4 w-4" />Email</span>
            <input type="email" placeholder="Enter your email" required className="w-full rounded-2xl border border-red-100 bg-amber-50/40 px-4 py-3 text-gray-800 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100" />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700"><LockKeyhole className="h-4 w-4" />Password</span>
            <input type="password" placeholder="Enter your password" required className="w-full rounded-2xl border border-red-100 bg-amber-50/40 px-4 py-3 text-gray-800 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100" />
          </label>

          <button type="submit" className="w-full rounded-2xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700">
            Login to Aldes Burger
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-red-600 hover:text-red-700">
            Sign up
          </Link>
        </p>
      </section>
    </main>
  )
}

export default Auth

import { LockKeyhole, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

function Auth() {
  const handleSubmit = (event) => {
    event.preventDefault()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-orange-50 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-md sm:p-8">
        <h1 className="text-center text-2xl font-black text-gray-800">Welcome back</h1>
        <p className="mt-2 text-center text-sm text-gray-500">Login to continue your burger journey.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700"><Mail className="h-4 w-4" />Email</span>
            <input type="email" placeholder="Enter your email" required className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700"><LockKeyhole className="h-4 w-4" />Password</span>
            <input type="password" placeholder="Enter your password" required className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
          </label>

          <button type="submit" className="w-full rounded-2xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600">
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-orange-500 hover:text-orange-600">
            Sign up
          </Link>
        </p>
      </section>
    </main>
  )
}

export default Auth

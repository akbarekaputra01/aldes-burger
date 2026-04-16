import { Sandwich, LockKeyhole, Mail, Phone, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

function SignUp() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-orange-50 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-md sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
            <Sandwich className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-gray-800">Create your burger account</h1>
          <p className="mt-2 text-sm text-gray-500">Join Aldes Burger and track every delicious order.</p>
        </div>

        <form className="space-y-4">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700"><UserRound className="h-4 w-4" />Name</span>
            <input className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100" type="text" placeholder="John Doe" required />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700"><Mail className="h-4 w-4" />Email</span>
            <input className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100" type="email" placeholder="john@email.com" required />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700"><Phone className="h-4 w-4" />Phone</span>
            <input className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100" type="tel" placeholder="+62 8xx xxxx xxxx" required />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700"><LockKeyhole className="h-4 w-4" />Password</span>
            <input className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100" type="password" required />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700"><LockKeyhole className="h-4 w-4" />Confirm Password</span>
            <input className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100" type="password" required />
          </label>

          <button type="submit" className="mt-2 w-full rounded-2xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600">
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-orange-500 hover:text-orange-600">
            Login
          </Link>
        </p>
      </section>
    </main>
  )
}

export default SignUp

import { Loader2, LockKeyhole, Mail, Phone, Sandwich, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { setAuthSession } from '../utils/auth'

function SignUp() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    setIsLoading(true)
    try {
      const { data } = await api.post('/register', form)
      setAuthSession(data)
      navigate(data.user?.role === 'admin' ? '/admin' : '/menu')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Unable to register. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-aldesCream px-4 py-10">
      <section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-md sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100 text-red-600">
            <Sandwich className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Create your burger account</h1>
          <p className="mt-2 text-sm text-gray-500">Join Aldes Burger and start building your signature meal.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700"><UserRound className="h-4 w-4" />Name</span>
            <input className="w-full rounded-2xl border border-red-100 bg-amber-50/40 px-4 py-3 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} type="text" placeholder="John Doe" required />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700"><Mail className="h-4 w-4" />Email</span>
            <input className="w-full rounded-2xl border border-red-100 bg-amber-50/40 px-4 py-3 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} type="email" placeholder="john@email.com" required />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700"><Phone className="h-4 w-4" />Phone</span>
            <input className="w-full rounded-2xl border border-red-100 bg-amber-50/40 px-4 py-3 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100" value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} type="tel" placeholder="+62 8xx xxxx xxxx" required />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700"><LockKeyhole className="h-4 w-4" />Password</span>
            <input className="w-full rounded-2xl border border-red-100 bg-amber-50/40 px-4 py-3 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100" value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} type="password" required />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700"><LockKeyhole className="h-4 w-4" />Confirm Password</span>
            <input className="w-full rounded-2xl border border-red-100 bg-amber-50/40 px-4 py-3 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100" value={form.password_confirmation} onChange={(event) => setForm((prev) => ({ ...prev, password_confirmation: event.target.value }))} type="password" required />
          </label>
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button type="submit" disabled={isLoading} className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-aldesRed px-4 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-red-600 hover:text-red-700">
            Login
          </Link>
        </p>
      </section>
    </main>
  )
}

export default SignUp

import { Loader2, LockKeyhole, Mail, UtensilsCrossed } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { setAuthSession } from '../utils/auth'

function Auth() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isLoading) return

    setError('')
    setIsLoading(true)

    try {
      const { data } = await api.post('/login', form)
      setAuthSession(data)

      const userResponse = await api.get('/user', {
        headers: { Authorization: `Bearer ${data.token}` },
      })
      const user = userResponse.data
      setAuthSession({ user })

      navigate(user.role === 'admin' ? '/admin' : '/menus')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Unable to login. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-aldesCream px-4 py-10">
      <section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-md sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-aldesRed/10 text-aldesRed">
            <UtensilsCrossed className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Welcome back, Burger Lover</h1>
          <p className="mt-2 text-sm text-gray-500">Sign in and continue your delicious order journey.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700"><Mail className="h-4 w-4" />Email</span>
            <input type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} placeholder="Enter your email" required className="w-full rounded-2xl border border-aldesRed/15 bg-aldesCream/40 px-4 py-3 text-gray-800 outline-none transition focus:border-aldesRed/50 focus:ring-2 focus:ring-aldesRed/15" />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700"><LockKeyhole className="h-4 w-4" />Password</span>
            <input type="password" value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} placeholder="Enter your password" required className="w-full rounded-2xl border border-aldesRed/15 bg-aldesCream/40 px-4 py-3 text-gray-800 outline-none transition focus:border-aldesRed/50 focus:ring-2 focus:ring-aldesRed/15" />
          </label>
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-2xl bg-aldesRed py-3 font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Signing in...' : 'Login to Aldes Burger'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-aldesRed hover:brightness-95">
            Sign up
          </Link>
        </p>
      </section>
    </main>
  )
}

export default Auth

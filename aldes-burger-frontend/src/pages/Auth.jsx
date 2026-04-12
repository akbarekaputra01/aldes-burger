import { useState } from 'react'

function Auth() {
  const [isLogin, setIsLogin] = useState(true)

  const handleSubmit = (event) => {
    event.preventDefault()
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-aldesCream p-4">
      <div className="absolute -left-16 top-16 h-48 w-48 rounded-full bg-aldesYellow/30 blur-3xl" />
      <div className="absolute -right-20 bottom-10 h-56 w-56 rounded-full bg-aldesRed/20 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl border border-aldesRed/10 bg-white p-8 shadow-xl">
        <p className="mb-2 text-center text-xs font-bold uppercase tracking-[0.25em] text-aldesRed/70">Aldes Account</p>
        <h1 className="text-center text-3xl font-black text-aldesRed">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
        <p className="mb-8 mt-2 text-center text-sm text-gray-600">
          {isLogin ? 'Login untuk lanjut pesan burger favoritmu.' : 'Daftar sekarang untuk collect reward dan cek riwayat order.'}
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700" htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 shadow-sm outline-none transition focus:border-aldesYellow focus:ring-2 focus:ring-aldesYellow/50"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 shadow-sm outline-none transition focus:border-aldesYellow focus:ring-2 focus:ring-aldesYellow/50"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 shadow-sm outline-none transition focus:border-aldesYellow focus:ring-2 focus:ring-aldesYellow/50"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-aldesRed py-3 font-bold text-white transition hover:brightness-110"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-700">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button type="button" className="font-semibold text-aldesRed underline-offset-2 hover:underline" onClick={() => setIsLogin((prev) => !prev)}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Auth

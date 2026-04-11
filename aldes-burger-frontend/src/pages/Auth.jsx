import { useState } from 'react'

function Auth() {
  const [isLogin, setIsLogin] = useState(true)

  const handleSubmit = (event) => {
    event.preventDefault()
  }

  return (
    <div className="bg-aldesCream min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-2xl shadow-lg bg-white">
        <h1 className="text-2xl font-bold text-aldesRed text-center">
          {isLogin ? 'Welcome Back' : 'Create Your Account'}
        </h1>
        <p className="text-sm text-gray-600 text-center mt-2 mb-6">
          {isLogin ? 'Login to continue your burger journey.' : 'Register now to collect rewards and track every order.'}
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-aldesYellow"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-aldesYellow"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-aldesYellow"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-aldesRed text-white py-3 rounded-lg font-semibold transition hover:opacity-90"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="text-sm text-gray-700 mt-6 text-center">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            className="text-aldesRed font-semibold"
            onClick={() => setIsLogin((prev) => !prev)}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Auth

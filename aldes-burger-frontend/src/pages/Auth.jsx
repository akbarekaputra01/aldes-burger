import { useState } from 'react'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'

function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
  }

  return (
    <main className="relative mx-auto flex min-h-[78vh] w-full max-w-5xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute left-0 top-12 h-56 w-56 rounded-full bg-aldesYellow/20 blur-3xl" />
      <div className="absolute bottom-10 right-0 h-52 w-52 rounded-full bg-aldesRed/20 blur-3xl" />

      <section className="relative z-10 grid w-full overflow-hidden rounded-[2rem] border border-aldesRed/10 bg-white shadow-2xl md:grid-cols-2">
        <div className="hidden bg-gradient-to-br from-aldesRed via-[#bb241a] to-[#e15e25] p-8 text-white md:block">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/80">Aldes Passport</p>
          <h1 className="mt-3 text-4xl font-black">One account for all burger cravings.</h1>
          <p className="mt-4 text-sm text-white/85">Simpan alamat, cek transaksi, dan dapatkan promo eksklusif member Aldes Burger.</p>
          <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm">
            <p className="flex items-center gap-2 font-bold">
              <ShieldCheck className="h-4 w-4 text-aldesYellow" /> Secure Login
            </p>
            <p className="mt-2 text-white/80">Akun kamu terlindungi untuk transaksi cepat dan aman.</p>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-aldesRed/70">Aldes Account</p>
          <h2 className="mt-2 text-3xl font-black text-aldesRed">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {isLogin ? 'Login untuk lanjut pesan burger favoritmu.' : 'Daftar sekarang untuk akses promo dan loyalty point.'}
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="fullName">
                  Full Name
                </label>
                <input id="fullName" type="text" placeholder="Enter your full name" className="w-full rounded-2xl border border-aldesRed/10 bg-white px-4 py-3 outline-none transition focus:border-aldesRed focus:ring-2 focus:ring-aldesYellow/40" />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="email">
                Email
              </label>
              <input id="email" type="email" placeholder="Enter your email" required className="w-full rounded-2xl border border-aldesRed/10 bg-white px-4 py-3 outline-none transition focus:border-aldesRed focus:ring-2 focus:ring-aldesYellow/40" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-2xl border border-aldesRed/10 bg-white px-4 py-3 pr-11 outline-none transition focus:border-aldesRed focus:ring-2 focus:ring-aldesYellow/40"
                />
                <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary mt-2 w-full">
              {isLogin ? 'Login' : 'Register'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-700">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button type="button" className="font-bold text-aldesRed" onClick={() => setIsLogin((prev) => !prev)}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}

export default Auth

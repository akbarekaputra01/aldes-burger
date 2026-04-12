import { FileText, ShoppingCart, User } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const navItems = [
  { to: '/transactions', label: 'Transactions', icon: FileText },
  { to: '/cart', label: 'Cart', icon: ShoppingCart },
  { to: '/profile', label: 'Profile', icon: User },
]

function Layout() {
  const { cartCount } = useCart()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-aldesCream text-slate-900">
      <header className="sticky top-0 z-50 border-b border-aldesRed/20 bg-aldesRed/95 text-aldesYellow shadow-lg backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-2">
            <span className="rounded-xl bg-aldesYellow px-2 py-1 text-sm font-black tracking-widest text-aldesRed">AB</span>
            <div>
              <p className="text-xl font-extrabold leading-none tracking-wide">Aldes Burger</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-aldesYellow/80">Fresh • Fast • Juicy</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to

              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative rounded-xl p-2.5 transition ${
                    isActive ? 'bg-aldesYellow text-aldesRed' : 'hover:bg-aldesYellow/20'
                  }`}
                  aria-label={label}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  {to === '/cart' && (
                    <span className="absolute -right-1 -top-1 rounded-xl border-2 border-aldesCream bg-aldesRed px-1.5 text-xs font-bold text-aldesYellow">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      <Outlet />

      <footer className="mt-12 bg-aldesRed p-8 text-aldesYellow">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <h4 className="mb-3 text-lg font-bold">Menu Links</h4>
            <ul className="space-y-2 text-sm text-aldesYellow/90">
              <li>Order Now</li>
              <li>Build Your Burger</li>
              <li>My Account</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-lg font-bold">Information</h4>
            <ul className="space-y-2 text-sm text-aldesYellow/90">
              <li>Contact</li>
              <li>Terms &amp; Conditions</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-lg font-bold">Social Media</h4>
            <ul className="space-y-2 text-sm text-aldesYellow/90">
              <li>Instagram</li>
              <li>Facebook</li>
              <li>TikTok</li>
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-8 w-full max-w-7xl border-t border-aldesYellow/30 pt-6 text-center text-sm">
          © 2026 Aldes Burger. All Rights Reserved.
        </p>
      </footer>
    </div>
  )
}

export default Layout

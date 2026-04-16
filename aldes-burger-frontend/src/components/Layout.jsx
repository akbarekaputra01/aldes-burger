import { ChefHat, FileText, House, ShoppingCart, User } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useCart } from '../context/useCart'

const navItems = [
  { to: '/', label: 'Home', icon: House },
  { to: '/kitchen', label: 'Kitchen', icon: ChefHat },
  { to: '/transactions', label: 'Orders', icon: FileText },
  { to: '/cart', label: 'Cart', icon: ShoppingCart },
  { to: '/profile', label: 'Profile', icon: User },
]

function Layout() {
  const { cartCount } = useCart()
  const location = useLocation()

  return (
    <div className="min-h-screen pb-24 text-slate-900 md:pb-0">
      <header className="sticky top-0 z-50 border-b border-aldesRed/10 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-aldesRed text-lg font-black text-aldesYellow shadow-lg shadow-aldesRed/30">AB</span>
            <div>
              <p className="text-lg font-black tracking-wide text-aldesRed sm:text-xl">Aldes Burger</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Bold • Juicy • Fast</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-2xl border border-aldesRed/10 bg-white p-1 md:flex">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to
              const NavIcon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-aldesRed text-white shadow-lg shadow-aldesRed/25' : 'text-slate-600 hover:bg-aldesYellow/40'
                  }`}
                >
                  <NavIcon className="h-4 w-4" />
                  {item.label}
                  {item.to === '/cart' && cartCount > 0 && (
                    <span className="absolute -right-2 -top-2 rounded-full bg-aldesYellow px-2 py-0.5 text-[11px] font-black text-aldesRed">{cartCount}</span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      <Outlet />

      <nav className="fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-1.5rem)] -translate-x-1/2 items-center justify-between rounded-2xl border border-aldesRed/15 bg-white/90 p-2 shadow-2xl backdrop-blur md:hidden">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to
          const NavIcon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition ${
                isActive ? 'bg-aldesRed text-white' : 'text-slate-600'
              }`}
            >
              <NavIcon className="h-4 w-4" />
              {item.label}
              {item.to === '/cart' && cartCount > 0 && <span className="absolute right-3 top-1 h-2 w-2 rounded-full bg-aldesYellow" />}
            </Link>
          )
        })}
      </nav>

      <footer className="mt-12 border-t border-aldesRed/10 bg-white/70 px-4 py-10 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-7xl gap-8 md:grid-cols-3">
          <div>
            <h4 className="text-lg font-black text-aldesRed">Aldes Burger</h4>
            <p className="mt-3 text-sm text-slate-600">Burger artisan dengan palet rasa bold khas Aldes: creamy, smoky, dan juicy.</p>
          </div>
          <div>
            <h5 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Popular</h5>
            <ul className="mt-3 space-y-2 text-sm font-medium text-slate-700">
              <li>Double Patty Series</li>
              <li>Build Your Own Burger</li>
              <li>Combo & Family Box</li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Support</h5>
            <ul className="mt-3 space-y-2 text-sm font-medium text-slate-700">
              <li>FAQ & Contact</li>
              <li>Refund Policy</li>
              <li>Terms & Conditions</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout

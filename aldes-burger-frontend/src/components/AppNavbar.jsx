import { ChevronDown, Search, ShoppingCart, UserCircle2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getToken } from '../utils/auth'

function AppNavbar() {
  const { cartCount } = useCart()
  const [searchKeyword, setSearchKeyword] = useState('')
  const isLoggedIn = Boolean(getToken())

  const logoTarget = useMemo(() => (isLoggedIn ? '/menus' : '/'), [isLoggedIn])

  return (
    <header className="sticky top-0 z-50 border-b border-aldesRed/15 bg-aldesCream/95 backdrop-blur">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-3 px-4 py-4 sm:grid-cols-[auto_1fr_auto] sm:gap-4 sm:px-6 lg:px-8">
        <Link to={logoTarget} className="text-xl font-black tracking-wide text-aldesRed transition hover:opacity-90">
          Aldes Burger
        </Link>

        <label className="flex items-center gap-2 rounded-2xl border border-aldesRed/15 bg-white px-3 py-2 shadow-sm">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder="Search burgers, drinks, and snacks"
            className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            type="text"
          />
        </label>

        <div className="flex items-center justify-end gap-3">
          <Link
            to="/cart"
            className="relative rounded-2xl bg-white p-2.5 text-gray-700 shadow-sm transition hover:bg-aldesRed/10"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -right-1.5 -top-1.5 min-w-5 rounded-full bg-aldesRed px-1.5 text-center text-xs font-bold text-white">
              {cartCount}
            </span>
          </Link>

          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-aldesYellow/25"
          >
            <UserCircle2 className="h-5 w-5 text-aldesRed" />
            Profile
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default AppNavbar

import { FileText, Search, ShoppingCart, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function Navbar({ isLoggedIn }) {
  const { cartCount } = useCart()

  return (
    <header className="sticky top-0 z-50 bg-aldesRed text-white shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to={isLoggedIn ? '/menus' : '/'} className="text-xl font-extrabold tracking-wide transition hover:opacity-90">
          Aldes Burger
        </Link>

        {isLoggedIn ? (
          <>
            <label className="hidden w-full max-w-xs items-center gap-2 rounded-2xl bg-white px-3 py-2 text-gray-600 md:flex">
              <Search className="h-4 w-4 text-aldesRed" />
              <input
                type="search"
                placeholder="Search burgers..."
                className="w-full bg-transparent text-sm text-gray-700 outline-none"
              />
            </label>

            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/transactions" className="rounded-2xl p-2 transition hover:bg-white/20" aria-label="Transactions">
                <FileText className="h-6 w-6" />
              </Link>
              <Link to="/cart" className="relative rounded-2xl p-2 transition hover:bg-white/20" aria-label="Cart">
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -right-1 -top-1 rounded-2xl bg-aldesRed px-1.5 text-xs font-bold text-white ring-2 ring-aldesCream">
                  {cartCount}
                </span>
              </Link>
              <Link to="/profile" className="rounded-2xl p-2 transition hover:bg-white/20" aria-label="Profile">
                <User className="h-6 w-6" />
              </Link>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-aldesRed transition hover:brightness-95">
              Login
            </Link>
            <Link to="/signup" className="rounded-2xl bg-aldesYellow px-4 py-2 text-sm font-semibold text-black transition hover:brightness-95">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar

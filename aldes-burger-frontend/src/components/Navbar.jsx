import {
  ReceiptText,
  ShoppingCart,
  User,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import aldesLogo from '../assets/logo-aldes-burger.png'

function Navbar({ isLoggedIn }) {
  const { cartCount } = useCart()
  const location = useLocation()

  const navItems = [
    {
      name: 'Transactions',
      path: '/transactions',
      icon: ReceiptText,
    },
    {
      name: 'Cart',
      path: '/cart',
      icon: ShoppingCart,
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: User,
    },
  ]

  return (
    <header className="sticky top-0 z-50 bg-aldesRed shadow-[0_2px_10px_rgba(0,0,0,0.15)]">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between overflow-visible px-6 sm:px-8 lg:px-10">

        {/* Logo */}
        <Link
          to={isLoggedIn ? '/menu' : '/'}
          className="flex items-center transition-transform duration-200 hover:scale-[1.02]"
        >
          <img
            src={aldesLogo}
            alt="Aldes Burger"
            className="h-20 w-auto object-contain sm:h-24 md:h-28"
          />
        </Link>

        {/* Slider Navigation */}
        {isLoggedIn ? (
          <nav className="flex items-center gap-2 rounded-full bg-white/15 p-2 backdrop-blur-sm">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              const isCart = item.name === 'Cart'

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative flex items-center gap-2 rounded-full px-5 py-2.5 font-black uppercase tracking-wide transition-all duration-300 ${
                    isActive
                      ? 'bg-aldesYellow text-black shadow-md'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {/* Icon wrapper */}
                  <div className="relative flex items-center">
                    <Icon className="h-5 w-5" />

                    {/* Cart Badge */}
                    {isCart && cartCount > 0 && (
                      <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-[10px] font-black text-white">
                        {cartCount}
                      </span>
                    )}
                  </div>

                  <span className="hidden text-sm sm:block">
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </nav>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl bg-white px-4 py-2 text-sm font-black uppercase tracking-wider text-black transition-all duration-200 hover:scale-105"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="rounded-xl bg-aldesYellow px-4 py-2 text-sm font-black uppercase tracking-wider text-black transition-all duration-200 hover:scale-105"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
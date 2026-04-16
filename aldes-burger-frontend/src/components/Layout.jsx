import { FileText, ShoppingCart, User } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function Layout() {
  const { cartCount } = useCart()

  return (
    <div className="min-h-screen bg-aldesCream">
      <header className="sticky top-0 z-50 bg-aldesRed text-white shadow-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="text-xl font-extrabold tracking-wide transition hover:opacity-90">
            Aldes Burger
          </Link>
          <div className="flex items-center gap-5">
            <Link to="/transactions" className="rounded-xl p-2 transition hover:bg-white/20" aria-label="Transactions">
              <FileText className="h-6 w-6" />
            </Link>
            <Link to="/cart" className="relative rounded-xl p-2 transition hover:bg-white/20" aria-label="Cart">
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -right-1 -top-1 rounded-xl border-2 border-aldesCream bg-white px-1.5 text-xs font-bold text-aldesRed">
                {cartCount}
              </span>
            </Link>
            <Link to="/profile" className="rounded-xl p-2 transition hover:bg-white/20" aria-label="Profile">
              <User className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </header>

      <div className="checkerboard-strip h-4" aria-hidden="true" />

      <Outlet />

      <footer className="mt-12 bg-aldesRed p-8 text-white">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <h4 className="mb-3 text-lg font-bold">Menu Links</h4>
            <ul className="space-y-2 text-sm">
              <li>Order Now</li>
              <li>Build Your Burger</li>
              <li>My Account</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-lg font-bold">Information</h4>
            <ul className="space-y-2 text-sm">
              <li>Contact</li>
              <li>Terms &amp; Conditions</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-lg font-bold">Social Media</h4>
            <ul className="space-y-2 text-sm">
              <li>Instagram</li>
              <li>Facebook</li>
              <li>TikTok</li>
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-8 w-full max-w-7xl text-center text-sm">© 2026 Aldes Burger. All Rights Reserved.</p>
      </footer>
      <div className="checkerboard-strip h-6" aria-hidden="true" />
    </div>
  )
}

export default Layout

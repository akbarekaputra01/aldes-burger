import { FileText, ShoppingCart, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function Navbar({ isLoggedIn }) {
  const { cartCount } = useCart()

  return (
    <header className="sticky top-0 z-50 bg-aldesRed">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        
        <Link 
          to={isLoggedIn ? '/menu' : '/'} 
          className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic text-aldesYellow"
        >
          Aldes Burger
        </Link>

        {isLoggedIn ? (
          <div className="flex items-center gap-3 sm:gap-5">
            <Link 
              to="/transactions" 
              className="rounded-xl p-2 text-white hover:text-aldesYellow transition-colors active:scale-95" 
              aria-label="Transactions"
            >
              <FileText className="h-6 w-6 stroke-3" />
            </Link>

            <Link 
              to="/cart" 
              className="relative rounded-xl p-2 text-white hover:text-aldesYellow transition-colors active:scale-95" 
              aria-label="Cart"
            >
              <ShoppingCart className="h-6 w-6 stroke-3" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-5 h-5 rounded-md bg-aldesYellow border-2 border-black px-1 flex items-center justify-center text-[10px] font-black text-black shadow-[1.5px_1.5px_0_0_#000]">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link 
              to="/profile" 
              className="rounded-xl p-2 text-white hover:text-aldesYellow transition-colors active:scale-95" 
              aria-label="Profile"
            >
              <User className="h-6 w-6 stroke-3" />
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link 
              to="/login" 
              className="rounded-xl bg-white px-4 py-2 text-sm font-black uppercase tracking-wider text-black border-3 border-black shadow-[3px_3px_0_0_#000] hover:bg-aldesYellow active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1.5px_1.5px_0_0_#000] transition-all"
            >
              Login
            </Link>
            
            <Link 
              to="/signup" 
              className="rounded-xl bg-aldesYellow px-4 py-2 text-sm font-black uppercase tracking-wider text-black border-3 border-black shadow-[3px_3px_0_0_#000] hover:bg-aldesYellow active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1.5px_1.5px_0_0_#000] transition-all"
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
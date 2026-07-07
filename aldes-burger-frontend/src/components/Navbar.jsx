import { useState } from 'react'
import {
  ReceiptText,
  ShoppingCart,
  User,
  UtensilsCrossed,
  Search, // <-- Import icon Search
  X,      // <-- Import icon X (close)
} from 'lucide-react'
import { Link, useLocation, useNavigate} from 'react-router-dom'
import { useCart } from '../context/CartContext'
import aldesLogo from '../assets/logo-aldes-burger.png'
function Navbar({ isLoggedIn }) {
  const { cartCount } = useCart()
  const location = useLocation()
  const navigate = useNavigate();

  
  // State khusus untuk Expandable Search
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Cek apakah user sedang di halaman Menu
  const isMenuPage = location.pathname === '/menu'

  const navItems = [
    {
      name: 'Menu',
      path: '/menu',
      icon: UtensilsCrossed,
    },
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
  
  // Fungsi saat user mengetik atau menekan Enter
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Ubah URL dan bawa kata kuncinya (contoh: /menu?q=ayam)
      navigate(`/menu?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate(`/menu`) // Reset jika kosong
    }
  }

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
            
            {/* --- FITUR EXPANDABLE SEARCH (HANYA MUNCUL DI /MENU) --- */}
            {isMenuPage && (
              <div 
                className={`relative flex items-center overflow-hidden transition-all duration-300 ease-out ${
                  showSearch 
                    ? 'w-[200px] sm:w-[250px] bg-aldesYellow border-2 border-black rounded-full shadow-[3px_3px_0_0_#000] ml-1' 
                    : 'w-10 bg-transparent rounded-full hover:bg-white/10'
                }`}
              >
                {showSearch ? (
                  <form onSubmit={handleSearchSubmit} className="flex w-full items-center px-3 py-1.5">
                    <Search className="h-4 w-4 text-black shrink-0" strokeWidth={3} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSearchQuery(val); // Update state lokal
                        // Update URL secara real-time
                        if (val.trim()) {
                          navigate(`/menu?q=${encodeURIComponent(val.trim())}`);
                        } else {
                          navigate(`/menu`); // Hapus query jika input kosong
                        }
                      }}
                      placeholder="CARI MENU..."
                      className="w-full bg-transparent px-2 text-sm font-black uppercase text-black placeholder-black/50 outline-none"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        setShowSearch(false);
                        setSearchQuery(''); // Kosongkan input
                        navigate('/menu');   // Balik ke menu awal
                      }}
                      className="text-black hover:text-aldesRed shrink-0"
                    >
                      <X className="h-4 w-4" strokeWidth={3} />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowSearch(true)}
                    className="flex h-10 w-10 items-center justify-center text-white"
                    title="Search Menu"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}
            {/* -------------------------------------------------------- */}

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
import { useState, useEffect } from 'react'
import {
  ReceiptText,
  ShoppingCart,
  User,
  UtensilsCrossed,
  Search,
  X,
  Menu as MenuIcon,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useTranslation } from '../context/LanguageContext'
import aldesLogo from '../assets/logo-aldes-burger.png'

function Navbar({ isLoggedIn }) {
  const { cartCount } = useCart()
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate();

  // State for Expandable Search bar
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Check if user is currently on the Menu page
  const isMenuPage = location.pathname === '/menu'

  // --- CLEANUP & FOCUS RESET ON ROUTE CHANGE ---
  useEffect(() => {
    setShowSearch(false)
    setSearchQuery('')
    setIsMobileMenuOpen(false)
    
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }, [location.pathname])
  // --------------------------------

  const navItems = [
    {
      name: t('navbar.menu'),
      path: '/menu',
      icon: UtensilsCrossed,
    },
    {
      name: t('navbar.transactions'),
      path: '/transactions',
      icon: ReceiptText,
    },
    {
      name: t('navbar.cart'),
      path: '/cart',
      icon: ShoppingCart,
    },
    {
      name: t('navbar.profile'),
      path: '/profile',
      icon: User,
    },
  ]
  
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/menu?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate(`/menu`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-aldesRed shadow-[0_2px_10px_rgba(0,0,0,0.15)] overflow-visible">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 overflow-visible">

        {/* Logo Left */}
        <Link
          to={isLoggedIn ? '/menu' : '/'}
          className="flex flex-shrink-0 items-center transition-transform duration-200 hover:scale-[1.02]"
        >
          <img
            src={aldesLogo}
            alt="Aldes Burger"
            className="h-16 w-auto object-contain sm:h-20 md:h-24"
          />
        </Link>

        {/* Right Navigation Controls */}
        {isLoggedIn ? (
          <>
            <nav 
              key={location.pathname}
              className="hidden md:flex flex-row items-center gap-1 sm:gap-2 rounded-full bg-white/10 p-1.5 backdrop-blur-sm max-w-full overflow-visible"
            >
              
              {/* --- EXPANDABLE SEARCH ELEMENT --- */}
              {isMenuPage && (
                <div 
                  className={`relative flex items-center overflow-hidden transition-all duration-300 ease-out h-9 sm:h-10 shrink-0 ${
                    showSearch 
                      ? 'w-[140px] sm:w-[220px] bg-aldesYellow border-2 border-black rounded-full shadow-[2px_2px_0_0_#000] mx-1' 
                      : 'w-9 sm:w-10 bg-transparent rounded-full hover:bg-white/10'
                  }`}
                >
                  {showSearch ? (
                    <form onSubmit={handleSearchSubmit} className="flex w-full items-center px-2.5">
                      <Search className="h-3.5 w-3.5 text-black shrink-0" strokeWidth={3} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSearchQuery(val);
                          if (val.trim()) {
                            navigate(`/menu?q=${encodeURIComponent(val.trim())}`);
                          } else {
                            navigate(`/menu`);
                          }
                        }}
                        placeholder={t('navbar.searchPlaceholder')}
                        className="w-full bg-transparent px-1.5 text-xs font-black uppercase text-black placeholder-black/50 outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          setShowSearch(false);
                          setSearchQuery('');
                          navigate('/menu');
                        }}
                        className="text-black hover:text-aldesRed shrink-0"
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={3} />
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => setShowSearch(true)}
                      className="flex h-full w-full items-center justify-center text-white"
                      title={t('navbar.searchTitle')}
                    >
                      <Search className="h-4 sm:h-5 w-4 sm:w-5" />
                    </button>
                  )}
                </div>
              )}

              {/* --- NAVIGATION LINKS --- */}
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                const isCart = item.path === '/cart'

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex flex-row items-center gap-1.5 rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-black uppercase tracking-wide transition-all duration-200 shrink-0 whitespace-nowrap ${
                      isActive
                        ? 'bg-aldesYellow text-black shadow-[2px_2px_0_0_#000] border border-black'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="relative flex items-center justify-center">
                      <Icon className="h-4 sm:h-4.5 w-4 sm:w-4.5" />
                      {isCart && cartCount > 0 && (
                        <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[9px] font-black text-white border border-aldesRed">
                          {cartCount}
                        </span>
                      )}
                    </div>
                    <span>
                      {item.name}
                    </span>
                  </Link>
                )
              })}
            </nav>

            {/* Mobile Hamburger Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </button>
            </div>
            
            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
              <div className="absolute top-[75px] left-4 right-4 bg-aldesRed border-2 border-black rounded-2xl shadow-[4px_4px_0_0_#000] p-4 flex flex-col gap-2 z-50 md:hidden animate-in slide-in-from-top-2 fade-in duration-200">
                {/* Search */}
                {isMenuPage && (
                  <form onSubmit={handleSearchSubmit} className="flex w-full items-center px-3 py-2 bg-aldesYellow border-2 border-black rounded-xl shadow-[2px_2px_0_0_#000] mb-2">
                    <Search className="h-4 w-4 text-black shrink-0" strokeWidth={3} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSearchQuery(val);
                        if (val.trim()) {
                          navigate(`/menu?q=${encodeURIComponent(val.trim())}`);
                        } else {
                          navigate(`/menu`);
                        }
                      }}
                      placeholder={t('navbar.searchPlaceholder')}
                      className="w-full bg-transparent px-2 text-sm font-black uppercase text-black placeholder-black/50 outline-none"
                    />
                  </form>
                )}
                {/* Links */}
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  const isCart = item.path === '/cart'

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`relative flex flex-row items-center gap-3 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-wide transition-all duration-200 ${
                        isActive
                          ? 'bg-aldesYellow text-black shadow-[2px_2px_0_0_#000] border border-black'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="relative flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                        {isCart && cartCount > 0 && (
                          <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-[10px] font-black text-white border border-aldesRed">
                            {cartCount}
                          </span>
                        )}
                      </div>
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/login"
              className="rounded-xl bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-black uppercase tracking-wider text-black transition-all duration-200 hover:scale-105 border border-black shadow-[2px_2px_0_0_#000]"
            >
              {t('navbar.login')}
            </Link>
            <Link
              to="/signup"
              className="rounded-xl bg-aldesYellow px-3 sm:px-4 py-2 text-xs sm:text-sm font-black uppercase tracking-wider text-black transition-all duration-200 hover:scale-105 border border-black shadow-[2px_2px_0_0_#000]"
            >
              {t('navbar.signup')}
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
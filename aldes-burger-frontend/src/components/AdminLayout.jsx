import { ChefHat, LayoutDashboard, Package, UtensilsCrossed, LogOut, Loader2 } from 'lucide-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import api from '../lib/api'
import { clearAuthSession } from '../utils/auth'

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/orders', label: 'Orders', icon: ChefHat },
  { to: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
  { to: '/admin/inventory', label: 'Inventory', icon: Package },
]

function AdminLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await api.post('/logout')
    } catch {
      // Abaikan error network, paksa hapus sesi lokal
    } finally {
      clearAuthSession()
      navigate('/login')
    }
  }

  return (
    <div className="h-screen bg-aldesCream lg:grid lg:grid-cols-[260px_1fr] overflow-hidden">
      {/* Sticky sidebar */}
      <aside className="bg-slate-900 text-white lg:h-screen lg:sticky lg:top-0 lg:overflow-y-auto p-4 lg:p-6 flex flex-col">
        <p className="text-xs uppercase tracking-[0.2em] text-red-200">Aldes Burger</p>
        <h1 className="mt-2 text-2xl font-black">Admin Panel</h1>
        <div className="checkerboard-strip mt-4 h-3 rounded-full" aria-hidden="true" />
        
        <nav className="mt-6 flex flex-col gap-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${isActive ? 'bg-red-600 text-white' : 'bg-white/10 text-slate-100 hover:bg-white/20'}`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}

          {/* Separator */}
          <div className="my-2 h-px w-full bg-white/10" />

          {/* Logout button */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            <span className="text-left flex-1">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </nav>
      </aside>
      
      {/* Main content area — scrollable */}
      <section className="min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Sticky top header */}
        <header className="sticky top-0 z-10 shrink-0 border-b border-red-100 bg-red-600 px-5 py-4 text-white sm:px-8">
          <h2 className="text-lg font-bold">Kitchen Operations &amp; Business Insights</h2>
        </header>
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </section>
    </div>
  )
}

export default AdminLayout
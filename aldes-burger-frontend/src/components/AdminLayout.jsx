import { ChefHat, LayoutDashboard, Package, UtensilsCrossed } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/orders', label: 'Orders', icon: ChefHat },
  { to: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
  { to: '/admin/inventory', label: 'Inventory', icon: Package },
]

function AdminLayout() {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-aldesCream lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="bg-slate-900 p-4 text-white lg:min-h-screen lg:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-red-200">Aldes Burger</p>
        <h1 className="mt-2 text-2xl font-black">Admin Panel</h1>
        <div className="checkerboard-strip mt-4 h-3 rounded-full" aria-hidden="true" />

        <nav className="mt-6 space-y-2">
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
        </nav>
      </aside>

      <section className="min-w-0">
        <header className="border-b border-red-100 bg-red-600 px-5 py-4 text-white sm:px-8">
          <h2 className="text-lg font-bold">Kitchen Operations & Business Insights</h2>
        </header>
        <Outlet />
      </section>
    </div>
  )
}

export default AdminLayout

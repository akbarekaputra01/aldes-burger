import { ChefHat, LayoutDashboard, Package, UtensilsCrossed } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/orders', label: 'Orders', icon: ChefHat },
  { to: '/admin/menus', label: 'Menus', icon: UtensilsCrossed },
  { to: '/admin/inventory', label: 'Inventory', icon: Package },
]

function AdminLayout() {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </header>
      <Outlet />
    </div>
  )
}

export default AdminLayout

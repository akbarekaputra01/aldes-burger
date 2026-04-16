import { useMemo, useState } from 'react'
import { ChefHat, CircleCheckBig, Timer } from 'lucide-react'

const initialOrders = [
  { id: 'ORD-1001', items: '2x Beef Burger, 1x Fries', status: 'Pending' },
  { id: 'ORD-1002', items: '1x Custom Burger, 2x Tea', status: 'Cooking' },
  { id: 'ORD-1003', items: '1x Spicy Chicken Burger, 1x Nugget', status: 'Pending' },
  { id: 'ORD-1004', items: '3x Family Box, 2x Soft Drink', status: 'Ready/Done' },
]

function AdminDashboard() {
  const [orders, setOrders] = useState(initialOrders)

  const metrics = useMemo(() => {
    const pending = orders.filter((order) => order.status === 'Pending').length
    const cooking = orders.filter((order) => order.status === 'Cooking').length
    const done = orders.filter((order) => order.status === 'Ready/Done').length
    return { pending, cooking, done }
  }, [orders])

  const updateOrderStatus = (orderId, nextStatus) => {
    setOrders((prevOrders) => prevOrders.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order)))
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="glass-card overflow-hidden">
        <header className="bg-gradient-to-r from-aldesRed via-[#c82f23] to-[#ea6a2a] px-6 py-7 text-white">
          <h1 className="text-3xl font-black">Aldes Staff & Kitchen Dashboard</h1>
          <p className="mt-2 text-sm text-white/90">Pantau status order real-time dan jaga speed service di jam sibuk.</p>
        </header>

        <div className="grid gap-3 border-b border-aldesRed/10 bg-white p-5 md:grid-cols-3">
          <div className="rounded-2xl border border-aldesRed/10 bg-aldesCream/30 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Pending</p>
            <p className="mt-2 flex items-center gap-2 text-3xl font-black text-aldesRed">
              <Timer className="h-7 w-7" /> {metrics.pending}
            </p>
          </div>
          <div className="rounded-2xl border border-aldesRed/10 bg-aldesCream/30 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Cooking</p>
            <p className="mt-2 flex items-center gap-2 text-3xl font-black text-aldesRed">
              <ChefHat className="h-7 w-7" /> {metrics.cooking}
            </p>
          </div>
          <div className="rounded-2xl border border-aldesRed/10 bg-aldesCream/30 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Done</p>
            <p className="mt-2 flex items-center gap-2 text-3xl font-black text-aldesRed">
              <CircleCheckBig className="h-7 w-7" /> {metrics.done}
            </p>
          </div>
        </div>

        <div className="space-y-3 p-5">
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-aldesRed/10 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-aldesRed">{order.id}</h2>
                  <p className="mt-1 text-sm text-slate-600">{order.items}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                    order.status === 'Pending'
                      ? 'bg-aldesYellow/60 text-aldesRed'
                      : order.status === 'Cooking'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {order.status}
                  </span>

                  {order.status === 'Pending' ? (
                    <button type="button" className="btn-secondary py-2 text-sm" onClick={() => updateOrderStatus(order.id, 'Cooking')}>
                      Mark Cooking
                    </button>
                  ) : order.status === 'Cooking' ? (
                    <button type="button" className="btn-primary py-2 text-sm" onClick={() => updateOrderStatus(order.id, 'Ready/Done')}>
                      Mark Ready
                    </button>
                  ) : (
                    <button type="button" className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
                      Completed
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default AdminDashboard

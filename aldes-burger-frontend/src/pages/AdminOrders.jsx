import { ChefHat } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../lib/api'

const nextStatus = { pending: 'cooking', cooking: 'done', done: 'done' }
const badgeClass = { pending: 'bg-yellow-100 text-yellow-700', cooking: 'bg-orange-100 text-orange-700', done: 'bg-emerald-100 text-emerald-700' }

function AdminOrders() {
  const [orders, setOrders] = useState([])

  const loadOrders = () => api.get('/admin/orders').then(({ data }) => setOrders(data)).catch(() => setOrders([]))

  useEffect(() => {
    loadOrders()
  }, [])

  const moveStatus = async (id) => {
    const order = orders.find((item) => item.id === id)
    if (!order || order.status === 'done') return

    await api.patch(`/admin/orders/${id}/status`, { status: nextStatus[order.status] })
    loadOrders()
  }

  const columns = ['pending', 'cooking', 'done']

  return (
    <main className="min-h-screen bg-aldesCream px-4 py-6 sm:px-6">
      <section className="mx-auto max-w-7xl">
        <h1 className="mb-6 flex items-center gap-2 text-2xl font-black text-gray-900"><ChefHat className="h-6 w-6 text-red-600" />Kitchen Display System</h1>
        <div className="grid gap-4 lg:grid-cols-3">
          {columns.map((column) => (
            <div key={column} className="rounded-3xl bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-gray-900">{column}</h2>
              <div className="space-y-3">
                {orders.filter((order) => order.status === column).map((order) => (
                  <article key={order.id} className="rounded-2xl border border-red-100 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-900">{order.id} · {order.user?.name}</p>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass[order.status]}`}>{order.status}</span>
                    </div>
                    {order.status !== 'done' && (
                      <button type="button" onClick={() => moveStatus(order.id)} className="mt-3 w-full rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700">
                        Mark as {nextStatus[order.status]}
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default AdminOrders

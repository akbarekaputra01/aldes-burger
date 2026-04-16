import { ChefHat } from 'lucide-react'
import { useState } from 'react'

const initialOrders = [
  {
    id: 'ORD-9001',
    customer: 'Nadia',
    status: 'Pending',
    items: [
      { name: 'Double Beef Burger', notes: ['REMOVE Tomato', 'ADD Extra Cheese'] },
      { name: 'Fries', notes: [] },
    ],
  },
  {
    id: 'ORD-9002',
    customer: 'Rizal',
    status: 'Cooking',
    items: [{ name: 'Spicy Chicken Burger', notes: ['REMOVE Onion'] }],
  },
  {
    id: 'ORD-9003',
    customer: 'Dewi',
    status: 'Done',
    items: [{ name: 'Custom Burger', notes: ['ADD Extra Patty', 'REMOVE Pickle'] }],
  },
]

const nextStatus = {
  Pending: 'Cooking',
  Cooking: 'Done',
  Done: 'Done',
}

function AdminOrders() {
  const [orders, setOrders] = useState(initialOrders)

  const moveStatus = (id) => {
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status: nextStatus[order.status] } : order)))
  }

  const columns = ['Pending', 'Cooking', 'Done']

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6">
      <section className="mx-auto max-w-7xl">
        <h1 className="mb-6 flex items-center gap-2 text-2xl font-black text-gray-800"><ChefHat className="h-6 w-6 text-orange-500" />Kitchen Display System</h1>
        <div className="grid gap-4 md:grid-cols-3">
          {columns.map((column) => (
            <div key={column} className="rounded-3xl bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-gray-800">{column}</h2>
              <div className="space-y-3">
                {orders.filter((order) => order.status === column).map((order) => (
                  <article key={order.id} className="rounded-2xl border border-gray-200 p-4">
                    <p className="font-semibold text-gray-900">{order.id} - {order.customer}</p>
                    <ul className="mt-2 space-y-2 text-sm text-gray-700">
                      {order.items.map((item) => (
                        <li key={`${order.id}-${item.name}`}>
                          <p className="font-medium">{item.name}</p>
                          {item.notes.length > 0 && (
                            <p className="text-xs text-orange-600">{item.notes.join(', ')}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                    {order.status !== 'Done' && (
                      <button
                        type="button"
                        onClick={() => moveStatus(order.id)}
                        className="mt-3 w-full rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                      >
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

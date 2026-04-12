import { useState } from 'react'

const initialOrders = [
  { id: 'ORD-1001', items: '2x Beef Burger, 1x Fries', status: 'Pending' },
  { id: 'ORD-1002', items: '1x Custom Burger, 2x Tea', status: 'Cooking' },
  { id: 'ORD-1003', items: '1x Spicy Chicken Burger, 1x Nugget', status: 'Pending' },
]

function AdminDashboard() {
  const [orders, setOrders] = useState(initialOrders)

  const updateOrderStatus = (orderId, nextStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: nextStatus } : order,
      ),
    )
  }

  return (
    <div className="min-h-screen bg-aldesCream p-4 md:p-8">
      <div className="mx-auto w-full max-w-6xl rounded-3xl border border-aldesRed/10 bg-white shadow-xl">
        <header className="rounded-t-3xl bg-aldesRed px-6 py-5 text-aldesYellow">
          <h1 className="text-2xl font-black md:text-3xl">Aldes Staff & Kitchen Dashboard</h1>
          <p className="mt-1 text-sm text-aldesYellow/85">Pantau status order secara real-time.</p>
        </header>

        <main className="p-5 md:p-6">
          <div className="grid grid-cols-12 rounded-xl bg-aldesCream p-4 text-xs font-bold uppercase tracking-wide text-aldesRed md:text-sm">
            <div className="col-span-3">Order ID</div>
            <div className="col-span-5">Items</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          <div className="mt-3 space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="grid grid-cols-12 items-center gap-2 rounded-2xl border border-aldesRed/10 bg-white p-4 shadow-sm">
                <div className="col-span-3 font-bold text-gray-800">{order.id}</div>
                <div className="col-span-5 text-sm text-gray-700 md:text-base">{order.items}</div>
                <div className="col-span-2">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      order.status === 'Pending'
                        ? 'bg-aldesYellow/40 text-amber-900'
                        : order.status === 'Cooking'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  {order.status === 'Pending' ? (
                    <button
                      type="button"
                      className="rounded-xl bg-aldesYellow px-3 py-2 text-xs font-bold text-black transition hover:brightness-95 md:text-sm"
                      onClick={() => updateOrderStatus(order.id, 'Cooking')}
                    >
                      Mark Cooking
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="rounded-xl bg-aldesRed px-3 py-2 text-xs font-bold text-white transition hover:brightness-110 md:text-sm"
                      onClick={() => updateOrderStatus(order.id, 'Ready/Done')}
                    >
                      Mark Ready
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard

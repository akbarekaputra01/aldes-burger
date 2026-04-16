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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-black p-4 text-white">
        <h1 className="text-2xl font-bold">Aldes Staff & Kitchen Dashboard</h1>
      </header>
      <div className="checkerboard-strip h-4" aria-hidden="true" />

      <main className="p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-200 text-sm font-semibold text-gray-700 p-4">
            <div className="col-span-3">Order ID</div>
            <div className="col-span-5">Items</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          {orders.map((order) => (
            <div
              key={order.id}
              className="grid grid-cols-12 items-center gap-2 border-t border-gray-200 p-4"
            >
              <div className="col-span-3 font-medium text-gray-800">{order.id}</div>
              <div className="col-span-5 text-gray-700">{order.items}</div>
              <div className="col-span-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-700'}`}>
                  {order.status}
                </span>
              </div>
              <div className="col-span-2 text-right">
                {order.status === 'Pending' ? (
                  <button
                    type="button"
                    className="bg-aldesYellow text-black px-3 py-2 rounded-lg text-sm font-semibold"
                    onClick={() => updateOrderStatus(order.id, 'Cooking')}
                  >
                    Mark as Cooking
                  </button>
                ) : (
                  <button
                    type="button"
                    className="bg-aldesRed text-white px-3 py-2 rounded-lg text-sm font-semibold"
                    onClick={() => updateOrderStatus(order.id, 'Ready/Done')}
                  >
                    Mark as Ready/Done
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      <div className="checkerboard-strip h-6" aria-hidden="true" />
    </div>
  )
}

export default AdminDashboard

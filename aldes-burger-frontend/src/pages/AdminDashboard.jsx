import { ChartColumnBig, Clock3, Flame, Wallet } from 'lucide-react'

const summaryCards = [
  { label: 'Orders Today', value: '148', icon: ChartColumnBig },
  { label: 'Pending', value: '17', icon: Clock3 },
  { label: 'Cooking', value: '24', icon: Flame },
  { label: 'Revenue', value: 'Rp 12.4M', icon: Wallet },
]

const latestOrders = [
  { id: 'ORD-1001', customer: 'Nadia', items: '2x Beef Burger, 1x Fries', status: 'Pending' },
  { id: 'ORD-1002', customer: 'Rizal', items: '1x Custom Burger, 2x Tea', status: 'Cooking' },
  { id: 'ORD-1003', customer: 'Dewi', items: '1x Spicy Chicken Burger, 1x Nugget', status: 'Done' },
]

const statusClass = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Cooking: 'bg-orange-100 text-orange-700',
  Done: 'bg-emerald-100 text-emerald-700',
}

function AdminDashboard() {
  return (
    <main className="min-h-screen bg-aldesCream p-4 sm:p-6 lg:p-8">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon
            return (
              <article key={card.label} className="rounded-3xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500">{card.label}</p>
                  <div className="rounded-xl bg-red-50 p-2 text-red-600"><Icon className="h-4 w-4" /></div>
                </div>
                <p className="mt-3 text-3xl font-black text-gray-900">{card.value}</p>
              </article>
            )
          })}
        </div>

        <article className="rounded-3xl bg-white shadow-sm">
          <div className="border-b border-red-100 px-5 py-4">
            <h3 className="text-lg font-bold text-gray-900">Latest Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-gray-500">
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {latestOrders.map((order) => (
                  <tr key={order.id} className="border-t border-red-50">
                    <td className="px-5 py-3 font-semibold text-gray-900">{order.id}</td>
                    <td className="px-5 py-3 text-gray-700">{order.customer}</td>
                    <td className="px-5 py-3 text-gray-700">{order.items}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass[order.status]}`}>{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </main>
  )
}

export default AdminDashboard

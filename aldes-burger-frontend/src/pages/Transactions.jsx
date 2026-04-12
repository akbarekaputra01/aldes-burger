import { useState } from 'react'
import { Clock3 } from 'lucide-react'

function Transactions() {
  const mockOnProgress = [
    {
      id: 'ORD-8821',
      date: 'Oct 24, 2026 - 14:30',
      total: 'Rp 65.000',
      items: '1x Custom Burger, 1x Soft Drink',
      status: 'Cooking',
      eta: '15 Mins',
    },
    {
      id: 'ORD-8822',
      date: 'Oct 24, 2026 - 15:10',
      total: 'Rp 45.000',
      items: '1x Spicy Crispy Chicken',
      status: 'Preparing',
      eta: '25 Mins',
    },
  ]

  const mockHistory = [
    {
      id: 'ORD-7710',
      date: 'Oct 10, 2026 - 19:00',
      total: 'Rp 115.000',
      items: '2x Beef Burger - Double Patty, 1x French Fries',
      status: 'Completed',
    },
    {
      id: 'ORD-7605',
      date: 'Sep 28, 2026 - 12:15',
      total: 'Rp 50.000',
      items: '1x Custom Burger (No Tomato), 1x Tea',
      status: 'Completed',
    },
  ]

  const [activeTab, setActiveTab] = useState('on_progress')
  const currentOrders = activeTab === 'on_progress' ? mockOnProgress : mockHistory

  return (
    <div className="min-h-screen bg-aldesCream p-4 md:p-8">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="text-3xl font-extrabold text-aldesRed md:text-4xl">My Transactions</h1>
        <p className="mt-1 text-sm text-gray-600">Pantau order yang sedang diproses dan riwayat pembelianmu.</p>

        <div className="mt-6 inline-flex rounded-full border border-aldesRed bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('on_progress')}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors md:text-base ${
              activeTab === 'on_progress' ? 'bg-aldesRed text-white' : 'text-gray-500 hover:text-aldesRed'
            }`}
          >
            On Progress
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors md:text-base ${
              activeTab === 'history' ? 'bg-aldesRed text-white' : 'text-gray-500 hover:text-aldesRed'
            }`}
          >
            History
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {currentOrders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-aldesRed/10 bg-white p-5 shadow-md">
              <header className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-aldesRed">{order.id}</h2>
                {activeTab === 'on_progress' ? (
                  <span className="rounded-full bg-aldesYellow px-3 py-1 text-xs font-semibold text-black">{order.status}</span>
                ) : (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{order.status}</span>
                )}
              </header>

              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-semibold text-gray-900">Order Date:</span> {order.date}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Items:</span> {order.items}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Total:</span>{' '}
                  <span className="font-bold text-aldesRed">{order.total}</span>
                </p>
              </div>

              {activeTab === 'on_progress' ? (
                <footer className="mt-4 flex items-center gap-2 rounded-xl border border-aldesYellow bg-aldesYellow/20 px-3 py-2 text-sm font-medium text-gray-800">
                  <Clock3 className="h-4 w-4" />
                  <span>Estimated Time: {order.eta}</span>
                </footer>
              ) : (
                <footer className="mt-4">
                  <button
                    type="button"
                    className="rounded-xl border border-aldesRed px-4 py-2 font-semibold text-aldesRed transition-colors hover:bg-aldesRed hover:text-white"
                  >
                    Reorder
                  </button>
                </footer>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Transactions

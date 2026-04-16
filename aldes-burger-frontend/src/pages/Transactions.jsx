import { useState } from 'react'
import { Clock3, RotateCcw } from 'lucide-react'

const mockOnProgress = [
  {
    id: 'ORD-8821',
    date: 'Apr 16, 2026 - 14:30',
    total: 'Rp 65.000',
    items: '1x Custom Burger, 1x Soft Drink',
    status: 'Cooking',
    eta: '15 mins',
    progress: 72,
  },
  {
    id: 'ORD-8822',
    date: 'Apr 16, 2026 - 15:10',
    total: 'Rp 45.000',
    items: '1x Spicy Crispy Chicken',
    status: 'Preparing',
    eta: '25 mins',
    progress: 38,
  },
]

const mockHistory = [
  {
    id: 'ORD-7710',
    date: 'Apr 10, 2026 - 19:00',
    total: 'Rp 115.000',
    items: '2x Beef Burger - Double Patty, 1x French Fries',
    status: 'Completed',
  },
  {
    id: 'ORD-7605',
    date: 'Mar 28, 2026 - 12:15',
    total: 'Rp 50.000',
    items: '1x Custom Burger (No Tomato), 1x Iced Tea',
    status: 'Completed',
  },
]

function Transactions() {
  const [activeTab, setActiveTab] = useState('on_progress')
  const currentOrders = activeTab === 'on_progress' ? mockOnProgress : mockHistory

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="glass-card p-6 md:p-7">
        <h1 className="section-title">My Transactions</h1>
        <p className="mt-2 text-sm text-slate-600">Pantau order yang sedang diproses dan ulangi menu favorit dengan sekali tap.</p>

        <div className="mt-6 inline-flex rounded-2xl border border-aldesRed/10 bg-white p-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('on_progress')}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
              activeTab === 'on_progress' ? 'bg-aldesRed text-white' : 'text-slate-600'
            }`}
          >
            On Progress
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${activeTab === 'history' ? 'bg-aldesRed text-white' : 'text-slate-600'}`}
          >
            History
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {currentOrders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-aldesRed/10 bg-white p-4 shadow-sm">
              <header className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-black text-aldesRed">{order.id}</h2>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${activeTab === 'on_progress' ? 'bg-aldesYellow/60 text-aldesRed' : 'bg-emerald-100 text-emerald-700'}`}>
                  {order.status}
                </span>
              </header>

              <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                <p>{order.date}</p>
                <p>{order.items}</p>
                <p className="font-black text-aldesRed">{order.total}</p>
              </div>

              {activeTab === 'on_progress' ? (
                <>
                  <div className="mt-4 h-2 rounded-full bg-aldesCream">
                    <div className="h-2 rounded-full bg-gradient-to-r from-aldesYellow to-aldesRed" style={{ width: `${order.progress}%` }} />
                  </div>
                  <footer className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Clock3 className="h-4 w-4 text-aldesRed" /> ETA: {order.eta}
                  </footer>
                </>
              ) : (
                <button type="button" className="btn-secondary mt-4 inline-flex items-center gap-2 py-2.5">
                  <RotateCcw className="h-4 w-4" /> Reorder
                </button>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Transactions

import { useEffect, useMemo, useState } from 'react'
import { Clock3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

function Transactions() {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState([])
  const [activeTab, setActiveTab] = useState('on_progress')

  useEffect(() => {
    api.get('/transactions').then(({ data }) => setTransactions(data)).catch(() => setTransactions([]))
  }, [])

  const currentOrders = useMemo(() => transactions.filter((order) => (activeTab === 'on_progress' ? order.status !== 'done' : order.status === 'done')), [activeTab, transactions])

  return (
    <div className="min-h-screen bg-aldesCream p-4 md:p-8">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="text-3xl font-extrabold text-aldesRed md:text-4xl">My Transactions</h1>
        <div className="mt-6 inline-flex rounded-full border border-aldesRed bg-white p-1">
          <button type="button" onClick={() => setActiveTab('on_progress')} className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors md:text-base ${activeTab === 'on_progress' ? 'bg-aldesRed text-white' : 'text-gray-500 hover:text-aldesRed'}`}>In Progress</button>
          <button type="button" onClick={() => setActiveTab('history')} className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors md:text-base ${activeTab === 'history' ? 'bg-aldesRed text-white' : 'text-gray-500 hover:text-aldesRed'}`}>History</button>
        </div>

        <div className="mt-6 space-y-4">
          {currentOrders.map((order) => (
            <article key={order.id} className="rounded-xl bg-white p-5 shadow" onClick={() => navigate(`/transactions/${order.id}`)}>
              <header className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-aldesRed">{order.id}</h2>
                <span className="rounded bg-aldesYellow px-2 py-1 text-xs font-semibold text-black">{order.status}</span>
              </header>

              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p><span className="font-semibold text-gray-900">Order Date:</span> {order.created_at}</p>
                <p><span className="font-semibold text-gray-900">Total:</span> <span className="font-bold text-aldesRed">Rp {order.amount.toLocaleString('id-ID')}</span></p>
              </div>

              {activeTab === 'on_progress' && (
                <footer className="mt-4 flex items-center gap-2 rounded-lg border border-aldesYellow bg-aldesYellow/30 px-3 py-2 text-sm font-medium text-gray-800">
                  <Clock3 className="h-4 w-4" />
                  <span>Track your order detail</span>
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

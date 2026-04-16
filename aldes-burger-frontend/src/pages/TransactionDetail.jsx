import { ReceiptText, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const mockedTransactions = {
  'TRX-2026-001': {
    id: 'TRX-2026-001',
    orderStatus: 'Cooking',
    destination_address: 'Jl. Sudirman No. 123, Jakarta Selatan',
    paymentMethod: 'Gopay',
    createdAt: '2026-04-16 18:20',
    items: [
      {
        id: 'it-11',
        name: 'Custom Beef Burger',
        qty: 1,
        snapshot_price: 65000,
        modifiers: ['No Tomato', 'Extra Cheese'],
      },
      {
        id: 'it-12',
        name: 'French Fries',
        qty: 1,
        snapshot_price: 25000,
        modifiers: [],
      },
    ],
  },
}

const toIDR = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)

const statusClass = {
  Pending: 'bg-amber-100 text-amber-700',
  Cooking: 'bg-orange-100 text-orange-700',
  Done: 'bg-emerald-100 text-emerald-700',
}

function TransactionDetail() {
  const { id } = useParams()
  const [transaction, setTransaction] = useState(null)

  useEffect(() => {
    setTransaction(mockedTransactions[id] ?? null)
  }, [id])

  if (!transaction) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-orange-50 p-6">
        <section className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-800">Transaction not found.</p>
        </section>
      </main>
    )
  }

  const total = transaction.items.reduce((sum, item) => sum + item.snapshot_price * item.qty, 0)

  return (
    <main className="min-h-screen bg-orange-50 px-4 py-8">
      <section className="mx-auto w-full max-w-2xl rounded-3xl bg-white p-6 shadow-md sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-dashed border-gray-200 pb-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Aldes Burger Digital Receipt</p>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-gray-800"><ReceiptText className="h-6 w-6 text-orange-500" />{transaction.id}</h1>
            <p className="mt-1 text-sm text-gray-500">Created at: {transaction.createdAt}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass[transaction.orderStatus]}`}>
            {transaction.orderStatus}
          </span>
        </div>

        <div className="rounded-2xl bg-orange-50 p-4">
          <p className="mb-1 flex items-center gap-2 font-semibold text-gray-800"><Truck className="h-4 w-4 text-orange-500" />Destination Address (Snapshot)</p>
          <p className="text-sm text-gray-600">{transaction.destination_address}</p>
          <p className="mt-2 text-sm text-gray-600">Payment: {transaction.paymentMethod}</p>
        </div>

        <div className="mt-5 space-y-3">
          {transaction.items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-800">{item.qty}x {item.name}</p>
                  <p className="text-sm text-gray-500">Snapshot Price: {toIDR(item.snapshot_price)}</p>
                </div>
                <p className="font-semibold text-gray-800">{toIDR(item.snapshot_price * item.qty)}</p>
              </div>
              {item.modifiers.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-sm text-gray-600">
                  {item.modifiers.map((modifier) => <li key={`${item.id}-${modifier}`}>{modifier}</li>)}
                </ul>
              )}
            </article>
          ))}
        </div>

        <div className="mt-6 border-t border-dashed border-gray-200 pt-4">
          <p className="flex items-center justify-between text-lg font-black text-gray-900">
            <span>Total Paid</span>
            <span>{toIDR(total)}</span>
          </p>
        </div>
      </section>
    </main>
  )
}

export default TransactionDetail

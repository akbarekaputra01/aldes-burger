import { ReceiptText, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api'

const toIDR = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)

const statusClass = {
  pending: 'bg-yellow-100 text-yellow-700',
  cooking: 'bg-orange-100 text-orange-700',
  done: 'bg-emerald-100 text-emerald-700',
}

function TransactionDetail() {
  const { id } = useParams()
  const [transaction, setTransaction] = useState(null)

  useEffect(() => {
    api.get(`/transactions/${id}`).then(({ data }) => setTransaction(data)).catch(() => setTransaction(null))
  }, [id])

  if (!transaction) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-aldesCream p-6">
        <section className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-800">Transaction not found.</p>
        </section>
      </main>
    )
  }

  const subtotal = transaction.details.reduce((sum, item) => sum + item.snapshot_price * item.quantity, 0)

  return (
    <main className="min-h-screen bg-aldesCream px-4 py-8">
      <section className="mx-auto w-full max-w-2xl rounded-3xl bg-white p-6 shadow-md sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-dashed border-red-200 pb-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Aldes Burger • Premium Digital Receipt</p>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-gray-900"><ReceiptText className="h-6 w-6 text-red-600" />{transaction.id}</h1>
            <p className="mt-1 text-sm text-gray-500">Created at: {transaction.created_at}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass[transaction.status]}`}>{transaction.status}</span>
        </div>

        <div className="rounded-2xl bg-amber-50/70 p-4">
          <p className="mb-1 flex items-center gap-2 font-semibold text-gray-900"><Truck className="h-4 w-4 text-red-600" />Address Snapshot</p>
          <p className="text-sm text-gray-600">{transaction.destination_address}</p>
          <p className="mt-2 text-sm text-gray-600">Payment Snapshot: {transaction.payment?.method}</p>
        </div>

        <div className="mt-5 space-y-3">
          {transaction.details.map((item) => (
            <article key={item.id} className="rounded-2xl border border-red-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{item.quantity}x {item.snapshot_name}</p>
                  <p className="text-sm text-gray-500">Snapshot Price: {toIDR(item.snapshot_price)}</p>
                </div>
                <p className="font-semibold text-gray-800">{toIDR(item.snapshot_price * item.quantity)}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 space-y-2 border-t border-dashed border-red-200 pt-4 text-sm">
          <p className="flex justify-between text-gray-600"><span>Items Subtotal</span><span>{toIDR(subtotal)}</span></p>
          <p className="flex justify-between border-t border-dashed border-red-200 pt-2 text-lg font-black text-gray-900"><span>Total Paid Snapshot</span><span>{toIDR(transaction.amount)}</span></p>
        </div>
      </section>
    </main>
  )
}

export default TransactionDetail

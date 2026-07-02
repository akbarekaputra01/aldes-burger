import { ReceiptText, Truck, Loader2, MapPin, CreditCard } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api'

const toIDR = (price) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price)

const statusClass = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  cooking: 'bg-orange-100 text-orange-700 border-orange-200',
  done: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

function TransactionDetail() {
  const { id } = useParams()
  const [transaction, setTransaction] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)

    api.get(`/transactions/${id}`)
      .then(({ data }) => setTransaction(data.data || data))
      .catch((err) => {
        console.error(err)
        setTransaction(null)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-aldesCream px-4">
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-white p-8 shadow-md">
          <Loader2 className="h-8 w-8 animate-spin text-aldesRed-600" />
          <p className="font-semibold text-gray-700">Memuat transaksi...</p>
        </div>
      </main>
    )
  }

  if (!transaction) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-aldesCream px-4">
        <div className="rounded-3xl bg-white p-8 shadow-md">
          <p className="font-semibold text-gray-800">
            Transaksi tidak ditemukan.
          </p>
        </div>
      </main>
    )
  }

  const subtotal = (transaction.details || []).reduce(
    (sum, item) => sum + item.snapshot_price * item.quantity,
    0
  )

  return (
    <main className="min-h-screen bg-gradient-to-b from-aldesCream to-white px-4 py-10">
      <section className="mx-auto max-w-3xl space-y-6">

        {/* Header */}
        <div className="rounded-3xl bg-white p-6 shadow-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-aldesRed-500">
                Aldes Burger
              </p>

              <h1 className="mt-2 flex items-center gap-2 text-2xl font-black text-gray-900">
                <ReceiptText className="h-6 w-6 text-aldesRed-600" />
                {transaction.id}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                {transaction.created_at}
              </p>
            </div>

            <span
              className={`rounded-full border px-4 py-2 text-xs font-bold capitalize ${
                statusClass[transaction.status] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {transaction.status}
            </span>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-aldesRed-500" />
              <p className="font-bold text-gray-900">Alamat Pengiriman</p>
            </div>

            <p className="text-sm leading-relaxed text-gray-600">
              {transaction.destination_address}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-aldesRed-500" />
              <p className="font-bold text-gray-900">Pembayaran</p>
            </div>

            <p className="text-sm text-gray-600">
              {transaction.payment?.method || '-'}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="rounded-3xl bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Detail Pesanan
          </h2>

          <div className="space-y-3">
            {(transaction.details || []).map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {item.quantity}x {item.snapshot_name}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {toIDR(item.snapshot_price)} / item
                    </p>
                  </div>

                  <p className="font-bold text-aldesRed-600">
                    {toIDR(item.snapshot_price * item.quantity)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-3xl bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Ringkasan Pembayaran
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{toIDR(subtotal)}</span>
            </div>

            <div className="border-t border-dashed pt-3">
              <div className="flex justify-between text-xl font-black text-gray-900">
                <span>Total</span>
                <span className="text-aldesRed-600">
                  {toIDR(transaction.amount)}
                </span>
              </div>
            </div>
          </div>
        </div>

      </section>
    </main>
  )
}

export default TransactionDetail

import { ReceiptText, Truck, Loader2, MapPin, CreditCard } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'

const toIDR = (price) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price)

const statusClass = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  cooking: 'bg-orange-100 text-orange-700 border-orange-300',
  done: 'bg-emerald-100 text-emerald-700 border-emerald-300',
}

function TransactionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [transaction, setTransaction] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    let pollingTimer = null

    const fetchTransactionDetails = () => {
      api.get(`/transactions/${id}`)
        .then(({ data }) => {
          if (!isMounted) return
          const txData = data.data || data
          setTransaction(txData)
          setIsLoading(false)
          
          // Simpan snapshot detail rincian ke cache temporer
          sessionStorage.setItem(`aldes_tx_detail_${id}`, JSON.stringify(txData))

          // AMAN & REAL-TIME: Jika status di database Vercel masih pending,
          // cek kembali otomatis ke server setiap 3 detik untuk mendeteksi Webhook Midtrans.
          if (txData && txData.status === 'pending') {
            pollingTimer = setTimeout(fetchTransactionDetails, 3000)
          }
        })
        .catch((err) => {
          if (!isMounted) return
          console.error(err)
          if (!sessionStorage.getItem(`aldes_tx_detail_${id}`)) {
            setTransaction(null)
          }
          setIsLoading(false)
        })
    }

    // SWR: Ambil cache detail spesifik transaksi jika ada
    const cachedDetail = sessionStorage.getItem(`aldes_tx_detail_${id}`)
    if (cachedDetail) {
      setTransaction(JSON.parse(cachedDetail))
      setIsLoading(false)
    } else {
      setIsLoading(true)
    }

    fetchTransactionDetails()

    return () => {
      isMounted = false
      if (pollingTimer) clearTimeout(pollingTimer)
    }
  }, [id])

  // --- Fungsi untuk memunculkan kembali popup Midtrans Snap ---
  const handleContinuePayment = () => {
    if (transaction?.snap_token) {
      window.snap.pay(transaction.snap_token, {
        onSuccess: () => {
          sessionStorage.removeItem(`aldes_tx_detail_${id}`)
          sessionStorage.removeItem('aldes_transactions_cache')
          navigate('/payment-status?status=success')
        },
        onPending: () => {
          alert('Your payment is being processed. Please wait.')
        },
        onError: () => {
          navigate('/payment-status?status=failed')
        },
        onClose: () => {
          alert('You closed the payment window. The order status remains pending.')
        }
      })
    } else {
      alert('Failed to load payment token. Please ensure the backend includes snap_token.')
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-aldesCream px-4">
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-white p-8 shadow-[4px_4px_0_0_#000] border-[3px] border-black">
          <Loader2 className="h-8 w-8 animate-spin text-aldesRed" />
          <p className="font-black uppercase text-gray-700 tracking-wider">Loading transaction...</p>
        </div>
      </main>
    )
  }

  if (!transaction) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-aldesCream px-4">
        <div className="rounded-3xl bg-white p-8 shadow-[4px_4px_0_0_#000] border-[3px] border-black">
          <p className="font-black uppercase text-gray-800">
            Transaction not found.
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
    <main className="min-h-screen bg-aldesCream font-sans text-black px-4 py-10 pb-20">
      <section className="mx-auto max-w-3xl space-y-6">
        {/* Header Transaksi */}
        <div className="rounded-3xl bg-white p-6 shadow-[5px_5px_0_0_#000] border-[3px] border-black">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase text-aldesRed tracking-widest">
                Aldes Burger
              </p>
              <h1 className="mt-2 flex items-center gap-2 text-2xl font-black text-gray-900">
                <ReceiptText className="h-6 w-6 text-aldesRed" strokeWidth={3} />
                {transaction.id}
              </h1>
              <p className="mt-2 text-sm font-bold text-gray-500 uppercase">
                {transaction.created_at}
              </p>
            </div>
            <span
              className={`self-start rounded-full border-2 px-4 py-2 text-xs font-black uppercase ${
                statusClass[transaction.status] || 'bg-gray-100 text-gray-700 border-gray-300'
              }`}
            >
              {transaction.status === 'pending' ? 'Pending Payment' : transaction.status}
            </span>
          </div>
        </div>

        {/* Informasi Pengiriman & Kotak Pembayaran */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Kotak Alamat */}
          <div className="rounded-3xl bg-white p-5 shadow-[4px_4px_0_0_#000] border-[3px] border-black">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-aldesRed" strokeWidth={3} />
              <p className="font-black uppercase text-gray-900 text-sm">Delivery Address</p>
            </div>
            <p className="text-sm font-bold text-gray-600 leading-relaxed uppercase">
              {transaction.destination_address}
            </p>
          </div>

          {/* Kotak Pembayaran */}
          <div className="flex flex-col justify-between rounded-3xl bg-white p-5 shadow-[4px_4px_0_0_#000] border-[3px] border-black">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-aldesRed" strokeWidth={3} />
                <p className="font-black uppercase text-gray-900 text-sm">Payment Method</p>
              </div>
              <p className="text-sm font-bold text-gray-600 uppercase">
                {transaction.payment?.method?.replace('_', ' ') || '-'}
              </p>
            </div>
            
            {/* Area Aksi Status Khusus */}
            <div className="mt-4 pt-3 border-t-2 border-dashed border-black/20 flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase text-gray-400">Status</span>
              
              {transaction.status === 'pending' ? (
                transaction.payment?.method !== 'cash' ? (
                  <button 
                     onClick={handleContinuePayment}
                    className="rounded-lg bg-aldesYellow px-3 py-1.5 text-[11px] font-black uppercase text-black border-2 border-black shadow-[2px_2px_0_0_#000] hover:bg-yellow-400 active:translate-y-[1px] active:translate-x-[1px] active:shadow-none transition-all flex items-center gap-1"
                  >
                    Continue Payment
                  </button>
                ) : (
                  <span className="rounded-lg bg-orange-100 px-3 py-1 text-[10px] font-black uppercase text-orange-700 border-2 border-orange-700">
                    Pending Payment
                  </span>
                )
              ) : transaction.status === 'cancelled' ? (
                <span className="rounded-lg bg-red-100 px-3 py-1 text-[10px] font-black uppercase text-red-700 border-2 border-red-700">
                  Cancelled
                </span>
              ) : (
                <span className="rounded-lg bg-green-100 px-3 py-1 text-[10px] font-black uppercase text-green-700 border-2 border-green-700 shadow-[2px_2px_0_0_#15803d]">
                  Paid
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Detail Item Pesanan */}
        <div className="rounded-3xl bg-white p-6 shadow-[5px_5px_0_0_#000] border-[3px] border-black">
          <h2 className="mb-4 text-lg font-black uppercase text-gray-900">
            Order Details
          </h2>
          <div className="space-y-3">
            {(transaction.details || []).map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border-2 border-black/10 bg-aldesCream/30 p-4 transition hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-black uppercase text-gray-900 text-sm">
                      {item.quantity}x {item.snapshot_name}
                    </p>                     <p className="mt-1 text-xs font-bold text-gray-500 uppercase">
                      {toIDR(item.snapshot_price)} / item
                    </p>
                  </div>
                  <p className="font-black text-aldesRed italic text-lg">
                    {toIDR(item.snapshot_price * item.quantity)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Ringkasan Jumlah Pembayaran */}
        <div className="rounded-3xl bg-white p-6 shadow-[5px_5px_0_0_#000] border-[3px] border-black">
          <h2 className="mb-4 text-lg font-black uppercase text-gray-900">
            Payment Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600 font-bold uppercase text-sm">
              <span>Subtotal</span>
              <span>{toIDR(subtotal)}</span>
            </div>
            <div className="border-t-2 border-dashed border-black/20 pt-3">
              <div className="flex justify-between items-end text-xl font-black text-gray-900 uppercase">
                <span>Total</span>
                <span className="text-aldesRed text-2xl italic">
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
import { ReceiptText, Truck, Loader2, MapPin, CreditCard } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useTranslation } from '../context/LanguageContext'

const toIDR = (price) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price)

const statusClass = {
  waiting_for_payment: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  pending: 'bg-orange-100 text-orange-700 border-orange-300',
  cooking: 'bg-emerald-100 text-emerald-700 border-emerald-300', // Note: assuming cooking/done are different but maybe original had cooking orange, done emerald. Let's keep original for others.
  done: 'bg-emerald-100 text-emerald-700 border-emerald-300',
}

function TransactionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [transaction, setTransaction] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isChangingPayment, setIsChangingPayment] = useState(false)

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
  const [tokenLoading, setTokenLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    setIsCancelling(true);
    try {
      await api.patch(`/transactions/${transaction.id}/cancel`);
      
      // Update local state to cancelled
      setTransaction(prev => ({ ...prev, status: 'cancelled' }));
      sessionStorage.removeItem(`aldes_tx_detail_${id}`);
      sessionStorage.removeItem('aldes_transactions_cache');
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleContinuePayment = async () => {
    let currentSnapToken = transaction?.snap_token;

    if (!currentSnapToken) {
      try {
        setTokenLoading(true);
        const res = await api.get(`/transactions/${transaction.id}/snap-token`);
        currentSnapToken = res.data.snap_token;
      } catch (e) {
        alert('Failed to load payment token. Please try again.');
        return;
      } finally {
        setTokenLoading(false);
      }
    }

    if (currentSnapToken) {
      window.snap.pay(currentSnapToken, {
        onSuccess: async () => {
          if (transaction.payment?.method === 'cash') {
            try {
              await api.patch(`/transactions/${transaction.id}/payment-method`, {
                payment_method: 'bank_transfer',
                is_success: true
              })
            } catch (e) {
              console.error(e)
            }
          }
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

  const handleChangePaymentMethod = async (newMethod) => {
    try {
      setIsChangingPayment(true)
      const res = await api.patch(`/transactions/${transaction.id}/payment-method`, {
        payment_method: newMethod
      })
      const txData = res.data.transaction || res.data
      setTransaction(txData)
      sessionStorage.setItem(`aldes_tx_detail_${id}`, JSON.stringify(txData))
      alert(`Payment method changed to ${newMethod.replace('_', ' ')}`)
    } catch (err) {
      console.error(err)
      alert('Failed to change payment method')
    } finally {
      setIsChangingPayment(false)
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-aldesCream px-4">
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-white p-8 shadow-[4px_4px_0_0_#000] border-[3px] border-black">
          <Loader2 className="h-8 w-8 animate-spin text-aldesRed" />
          <p className="font-black uppercase text-gray-700 tracking-wider">{t('common.loading')}</p>
        </div>
      </main>
    )
  }

  if (!transaction) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-aldesCream px-4">
        <div className="rounded-3xl bg-white p-8 shadow-[4px_4px_0_0_#000] border-[3px] border-black">
          <p className="font-black uppercase text-gray-800">
            {t('common.noData')}
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
    <main className="min-h-screen bg-aldesCream text-black px-4 py-10 pb-20">
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
              {transaction.status === 'waiting_for_payment' ? 'Waiting for Payment' : transaction.status}
            </span>
          </div>
        </div>

        {/* Informasi Pengiriman & Kotak Pembayaran */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Kotak Alamat */}
          <div className="rounded-3xl bg-white p-5 shadow-[4px_4px_0_0_#000] border-[3px] border-black">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-aldesRed" strokeWidth={3} />
              <p className="font-black uppercase text-gray-900 text-sm">{t('transactionDetail.deliveryAddress')}</p>
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
                <p className="font-black uppercase text-gray-900 text-sm">{t('transactionDetail.paymentMethod')}</p>
              </div>
              <p className="text-sm font-bold text-gray-600 uppercase">
                {transaction.payment?.method?.replace('_', ' ') || '-'}
              </p>
            </div>
            
            {/* Area Aksi Status Khusus */}
            <div className="mt-4 pt-3 border-t-2 border-dashed border-black/20 flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase text-gray-400">{t('transactionDetail.status')}</span>
              
              {transaction.status === 'waiting_for_payment' ? (
                <div className="flex gap-2">
                  <button 
                     onClick={() => handleChangePaymentMethod('cash')}
                     disabled={isChangingPayment}
                    className="rounded-lg bg-gray-200 px-3 py-1.5 text-[11px] font-black uppercase text-black border-2 border-black hover:bg-gray-300 active:translate-y-[1px] active:translate-x-[1px] transition-all disabled:opacity-50"
                  >
                    Change to Cash
                  </button>
                  <button 
                     onClick={handleContinuePayment}
                     disabled={isChangingPayment}
                    className="rounded-lg bg-aldesYellow px-3 py-1.5 text-[11px] font-black uppercase text-black border-2 border-black shadow-[2px_2px_0_0_#000] hover:bg-yellow-400 active:translate-y-[1px] active:translate-x-[1px] active:shadow-none transition-all flex items-center gap-1 disabled:opacity-50"
                  >
                    {t('transactionDetail.payNow')}
                  </button>
                </div>
              ) : transaction.status === 'pending' && transaction.payment?.method === 'cash' ? (
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-orange-100 px-3 py-1 text-[10px] font-black uppercase text-orange-700 border-2 border-orange-700">
                    Pending
                  </span>
                  <button 
                     onClick={handleContinuePayment}
                     disabled={isChangingPayment || tokenLoading}
                    className="rounded-lg bg-gray-200 px-3 py-1.5 text-[11px] font-black uppercase text-black border-2 border-black hover:bg-gray-300 active:translate-y-[1px] active:translate-x-[1px] transition-all disabled:opacity-50"
                  >
                    {tokenLoading ? 'Loading...' : 'Change to Online'}
                  </button>
                </div>
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
            {t('transactionDetail.orderItems')}
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
            {t('checkout.orderSummary')}
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600 font-bold uppercase text-sm">
              <span>{t('transactionDetail.subtotal')}</span>
              <span>{toIDR(subtotal)}</span>
            </div>
            <div className="border-t-2 border-dashed border-black/20 pt-3">
              <div className="flex justify-between items-end text-xl font-black text-gray-900 uppercase">
                <span>{t('transactionDetail.total')}</span>
                <span className="text-aldesRed text-2xl italic">
                  {toIDR(transaction.amount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tombol Cancel */}
        {(transaction.status === 'pending' || transaction.status === 'waiting_for_payment') && (
          <div className="mt-6 flex justify-center">
             <button
               onClick={handleCancelOrder}
               disabled={isCancelling}
               className="w-full rounded-2xl bg-red-100 py-4 text-sm font-black uppercase text-red-600 border-2 border-red-600 hover:bg-red-200 active:scale-95 transition-all disabled:opacity-50"
             >
               {isCancelling ? 'Cancelling...' : 'Cancel Order'}
             </button>
          </div>
        )}
      </section>
    </main>
  )
}

export default TransactionDetail
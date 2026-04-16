import { CheckCircle2, ReceiptText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function PaymentStatus() {
  const navigate = useNavigate()

  return (
    <main className="mx-auto flex min-h-[75vh] w-full max-w-4xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <section className="glass-card relative w-full overflow-hidden p-8 text-center md:p-10">
        <div className="absolute -left-12 top-0 h-36 w-36 rounded-full bg-aldesYellow/30 blur-2xl" />
        <div className="absolute -right-10 bottom-0 h-36 w-36 rounded-full bg-aldesRed/20 blur-2xl" />

        <CheckCircle2 className="relative z-10 mx-auto h-20 w-20 text-emerald-500" />
        <h1 className="relative z-10 mt-4 text-3xl font-black text-aldesRed">Payment Successful!</h1>
        <p className="relative z-10 mx-auto mt-2 max-w-md text-slate-600">Pesananmu sudah kami terima dan sedang diproses. Kamu bisa pantau update order secara real-time.</p>

        <div className="relative z-10 mx-auto mt-6 flex max-w-md items-center gap-3 rounded-2xl border border-aldesRed/10 bg-white p-4 text-left">
          <ReceiptText className="h-5 w-5 text-aldesRed" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Order ID</p>
            <p className="text-sm font-black text-aldesRed">ORD-89421</p>
          </div>
        </div>

        <div className="relative z-10 mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" className="btn-primary" onClick={() => navigate('/transactions')}>
            View Transactions
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </section>
    </main>
  )
}

export default PaymentStatus

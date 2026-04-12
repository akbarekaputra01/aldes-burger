import { CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function PaymentStatus() {
  const navigate = useNavigate()

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-aldesCream p-4">
      <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-aldesYellow/30 blur-3xl" />
      <div className="absolute -right-16 bottom-8 h-48 w-48 rounded-full bg-aldesRed/20 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl border border-aldesRed/10 bg-white p-8 text-center shadow-xl">
        <CheckCircle className="mx-auto mb-4 h-20 w-20 text-emerald-500" />
        <h1 className="mb-3 text-3xl font-black text-aldesRed">Payment Successful!</h1>
        <p className="mb-8 text-gray-600">Pesananmu sudah kami terima dan sedang disiapkan oleh chef kami.</p>

        <div className="space-y-3">
          <button
            type="button"
            className="w-full rounded-xl bg-aldesRed py-3 font-bold text-white transition hover:brightness-110"
            onClick={() => navigate('/transactions')}
          >
            View My Transactions
          </button>
          <button
            type="button"
            className="w-full rounded-xl border border-aldesRed py-3 font-semibold text-aldesRed transition hover:bg-aldesRed hover:text-white"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentStatus

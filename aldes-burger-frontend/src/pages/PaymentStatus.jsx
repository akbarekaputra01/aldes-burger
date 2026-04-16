import { CheckCircle2, CircleX, LoaderCircle } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

function PaymentStatus() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const status = useMemo(() => searchParams.get('status') ?? 'success', [searchParams])
  const isSuccess = status !== 'failed'

  return (
    <main className="flex min-h-screen items-center justify-center bg-aldesCream px-4 py-10">
      <section className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-md">
        <div className={`mx-auto mb-5 inline-flex h-24 w-24 items-center justify-center rounded-full ${isSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
          {isSuccess ? <CheckCircle2 className="h-14 w-14 animate-pulse" /> : <CircleX className="h-14 w-14" />}
        </div>

        <h1 className="text-3xl font-black text-gray-900">{isSuccess ? 'Payment Successful!' : 'Payment Failed'}</h1>
        <p className="mt-2 text-gray-500">
          {isSuccess
            ? 'Your burger is now in our kitchen queue. Track your order in real time.'
            : 'Your transaction could not be completed. Please retry the payment method.'}
        </p>

        <div className="mt-7 space-y-3">
          <button type="button" className="w-full rounded-2xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700" onClick={() => navigate('/transactions')}>
            {isSuccess ? 'Track Order' : 'Back to Transactions'}
          </button>
          {!isSuccess && (
            <button type="button" className="w-full rounded-2xl border border-yellow-300 bg-yellow-100 py-3 font-semibold text-yellow-800 transition hover:bg-yellow-200" onClick={() => navigate('/checkout')}>
              Try Payment Again
            </button>
          )}
          {isSuccess && (
            <button type="button" className="mx-auto inline-flex items-center gap-2 text-sm font-medium text-gray-500" onClick={() => navigate('/')}>
              <LoaderCircle className="h-4 w-4 animate-spin" /> Preparing your meal update...
            </button>
          )}
        </div>
      </section>
    </main>
  )
}

export default PaymentStatus

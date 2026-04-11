import { CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function PaymentStatus() {
  const navigate = useNavigate()

  return (
    <div className="bg-aldesCream min-h-screen flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-lg p-8 text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-aldesRed mb-3">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">Your burger is currently being prepared by our chefs.</p>

        <div className="space-y-3">
          <button
            type="button"
            className="w-full bg-aldesRed text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
            onClick={() => navigate('/transactions')}
          >
            View My Transactions
          </button>
          <button
            type="button"
            className="w-full border border-aldesRed text-aldesRed py-3 rounded-lg font-semibold hover:bg-aldesRed hover:text-white transition"
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

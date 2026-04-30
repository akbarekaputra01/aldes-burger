import React, { useMemo } from 'react'
import { CircleX } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

// --- IMPORT ASSETS ---
// Pastikan path ini benar sesuai struktur foldermu
import imgBurgerCooking from '../assets/burger_cooking.gif'

function PaymentStatus() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Default ke 'success' jika tidak ada param status
  const status = useMemo(() => searchParams.get('status') ?? 'success', [searchParams])
  const isSuccess = status !== 'failed'

  return (
    <main className="flex min-h-screen items-center justify-center bg-aldesCream px-4 py-10">
      <section className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-md animate-in fade-in zoom-in duration-300">
        
        {isSuccess ? (
          /* Bagian Sukses - GIF Kotak Utuh */
          <div className="mx-auto mb-6 flex w-full max-w-sm items-center justify-center overflow-hidden rounded-2xl bg-gray-50 border-2 border-gray-100 p-2">
            <img 
              src={imgBurgerCooking} 
              alt="Burger is cooking" 
              // object-contain memastikan seluruh GIF kelihatan tanpa terpotong
              className="h-full w-full object-contain" 
            />
          </div>
        ) : (
          /* Bagian Gagal */
          <div className="mx-auto mb-5 inline-flex h-24 w-24 items-center justify-center rounded-full bg-red-100 text-red-600">
            <CircleX className="h-14 w-14" />
          </div>
        )}

        <h1 className="text-3xl font-black text-gray-900">
          {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
        </h1>
        
        <p className="mt-2 text-gray-500 text-sm sm:text-base px-2">
          {isSuccess
            ? 'Your burger is now in our kitchen queue. Track your order in real time.'
            : 'Your transaction could not be completed. Please retry the payment method.'}
        </p>

        <div className="mt-8 space-y-3">
          <button 
            type="button" 
            className="w-full rounded-2xl bg-red-600 py-3.5 font-bold text-white transition hover:bg-red-700 active:scale-95 shadow-lg shadow-red-100" 
            onClick={() => navigate('/transactions')}
          >
            {isSuccess ? 'Track Order' : 'Back to Transactions'}
          </button>
          
          {!isSuccess && (
            <button 
              type="button" 
              className="w-full rounded-2xl border-2 border-yellow-300 bg-yellow-50 py-3 font-bold text-yellow-800 transition hover:bg-yellow-100 active:scale-95" 
              onClick={() => navigate('/checkout')}
            >
              Try Payment Again
            </button>
          )}
          
          {isSuccess && (
            <button 
              type="button" 
              className="w-full rounded-2xl border-2 border-gray-100 bg-white py-3 font-bold text-gray-600 transition hover:bg-gray-50 active:scale-95" 
              onClick={() => navigate('/menu')}
            >
              Back to Home
            </button>
          )}
        </div>
      </section>
    </main>
  )
}

export default PaymentStatus
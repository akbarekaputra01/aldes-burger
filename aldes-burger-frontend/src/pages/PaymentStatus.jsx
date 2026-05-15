import React, { useMemo } from 'react'
import { CircleX, TicketCheck, ArrowRight, Home, LayoutList } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

// --- IMPORT ASSETS ---
import imgBurgerCooking from '../assets/burger_cooking.gif'

function PaymentStatus() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Default ke 'success' jika tidak ada param status
  const status = useMemo(() => searchParams.get('status') ?? 'success', [searchParams])
  const isSuccess = status !== 'failed'

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F3E8CC] px-4 py-10 font-sans">
      <section className="relative w-full max-w-lg rounded-[2.5rem] border-[6px] border-black bg-white p-8 md:p-12 text-center shadow-[12px_12px_0_0_#000] animate-in fade-in zoom-in duration-300">
        
        {/* Badge Status Melayang */}
        <div className={`absolute -top-6 left-1/2 -translate-x-1/2 -rotate-2 border-[4px] border-black px-6 py-2 rounded-xl shadow-[4px_4px_0_0_#000] z-20 ${isSuccess ? 'bg-[#FFC926]' : 'bg-[#D52518]'}`}>
          <span className={`font-black uppercase italic tracking-tighter text-lg ${isSuccess ? 'text-black' : 'text-white'}`}>
            {isSuccess ? 'ORDER CONFIRMED!' : 'PAYMENT ERROR!'}
          </span>
        </div>

        {isSuccess ? (
          /* Bagian Sukses - GIF dengan Frame Neobrutalism */
          <div className="mx-auto mb-8 mt-4 flex w-full max-w-xs items-center justify-center overflow-hidden rounded-3xl border-[5px] border-black bg-white p-2 shadow-[8px_8px_0_0_#000]">
            <img 
              src={imgBurgerCooking} 
              alt="Burger is cooking" 
              className="h-full w-full object-contain rounded-xl" 
            />
          </div>
        ) : (
          /* Bagian Gagal */
          <div className="mx-auto mb-8 mt-4 inline-flex h-28 w-28 items-center justify-center rounded-full border-[5px] border-black bg-white text-[#D52518] shadow-[8px_8px_0_0_#000]">
            <CircleX className="h-16 w-16 stroke-[3]" />
          </div>
        )}

        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black leading-none">
          {isSuccess ? 'YUMMY! IT\'S ON THE WAY' : 'OH NO! STOP RIGHT THERE'}
        </h1>
        
        <p className="mt-4 font-bold uppercase text-gray-500 text-xs md:text-sm tracking-wide">
          {isSuccess
            ? 'Your burger is now in our kitchen queue. Track your order in real time.'
            : 'Your transaction could not be completed. Please retry the payment method.'}
        </p>

        <div className="mt-10 space-y-4">
          {/* Tombol Utama */}
          <button 
            type="button" 
            className={`flex w-full items-center justify-center gap-3 rounded-2xl border-[5px] border-black py-4 text-xl font-black uppercase transition-all active:translate-y-1 active:shadow-[0_4px_0_0_#000] shadow-[0_8px_0_0_#000] ${
              isSuccess ? 'bg-[#D52518] text-[#FFC926]' : 'bg-[#FFC926] text-black'
            }`} 
            onClick={() => navigate('/transactions')}
          >
            {isSuccess ? (
              <>TRACK ORDER <TicketCheck size={28} strokeWidth={3} /></>
            ) : (
              <>BACK TO TRANSACTIONS <LayoutList size={28} strokeWidth={3} /></>
            )}
          </button>
          
          {/* Tombol Sekunder */}
          {!isSuccess && (
            <button 
              type="button" 
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-[5px] border-black bg-white py-4 text-xl font-black uppercase text-black transition-all hover:bg-gray-50 active:translate-y-1 active:shadow-[0_4px_0_0_#000] shadow-[0_8px_0_0_#000]" 
              onClick={() => navigate('/checkout')}
            >
              TRY AGAIN <ArrowRight size={24} strokeWidth={4} />
            </button>
          )}
          
          {isSuccess && (
            <button 
              type="button" 
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-[5px] border-black bg-white py-4 text-xl font-black uppercase text-black transition-all hover:bg-gray-50 active:translate-y-1 active:shadow-[0_4px_0_0_#000] shadow-[0_8px_0_0_#000]" 
              onClick={() => navigate('/menu')}
            >
              <Home size={24} strokeWidth={4} className="text-[#D52518]" /> BACK TO HOME
            </button>
          )}
        </div>
      </section>
    </main>
  )
}

export default PaymentStatus
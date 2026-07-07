import { useState, useEffect, useRef } from 'react'
import { ChefHat, Flame, ArrowRight, Sliders, Truck, Star, CheckCircle2, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getToken } from '../utils/auth'

// --- ASSETS ---
import burgerImg from '../assets/menus/1.jpg'
import imgBottom from '../assets/bottom_burger.png'
import imgTop from '../assets/top_burger.png'
import imgBeef from '../assets/beef_patty.png'
import imgCheese from '../assets/cheese.png'
import imgLettuce from '../assets/lettuce.png'
import imgTomato from '../assets/tomato.png'

const crazyStacks = [
  { id: 1, name: 'The Heart Attack', creator: 'Bima', review: "I couldn't finish it, but no regrets. Best custom burger ever!", bgColor: 'bg-aldesYellow', rotation: '-rotate-2' },
  { id: 2, name: 'Sauce Boss', creator: 'Rachel', review: "Messy. Juicy. Absolutely perfect. The secret sauce is magic.", bgColor: 'bg-aldesRed', textColor: 'text-white', rotation: 'rotate-2' },
  { id: 3, name: 'Keto Monster', creator: 'Sarah', review: "Diet-friendly but still tastes like a cheat meal. So fresh!", bgColor: 'bg-blue-500', textColor: 'text-white', rotation: '-rotate-1' }
]

function LandingPage() {
  const navigate = useNavigate()
  const isAuthenticated = Boolean(getToken())

  // STATE & REF UNTUK ANIMASI SCROLL-TO-STACK
  const [progress, setProgress] = useState(0)
  const stickySectionRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!stickySectionRef.current) return
      
      const offsetTop = stickySectionRef.current.offsetTop
      const height = stickySectionRef.current.offsetHeight
      const windowHeight = window.innerHeight
      
      // Animasi dimulai saat area kuning ini menyentuh bawah Navbar (estimasi tinggi navbar 80px)
      const start = offsetTop - 80
      // Animasi selesai saat user hampir mencapai akhir area kuning
      const end = start + height - windowHeight
      
      // Hitung persentase scroll (0.0 sampai 1.0)
      let p = (window.scrollY - start) / (end - start)
      
      // Kunci nilai agar tidak kurang dari 0 atau lebih dari 1
      p = Math.max(0, Math.min(p, 1))
      setProgress(p)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Trigger sekali saat pertama render
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Kalkulasi CSS dinamis berdasarkan posisi Scroll (Progress 0.0 -> 1.0)
  // Format: (startX, startY, startRot, endX, endY, endRot)
  const getStyle = (sx, sy, sr, ex, ey, er) => {
    const currentX = sx + (ex - sx) * progress
    const currentY = sy + (ey - sy) * progress
    const currentRot = sr + (er - sr) * progress
    
    return {
      // Posisi dasar di tengah layar (top-1/2 left-1/2), lalu di-offset sesuai scroll
      transform: `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px)) rotate(${currentRot}deg)`,
      // Efek pegas/transisi halus agar tidak patah-patah
      transition: 'transform 0.1s ease-out'
    }
  }

  const handleStartCustomizing = () => {
    if (isAuthenticated) navigate('/menu')
    else navigate('/login')
  }

  return (
    <main className="bg-aldesCream text-black font-sans selection:bg-aldesRed selection:text-white">
      
      {/* --- HERO SECTION (STATIS & CLEAN) --- */}
      <section className="relative mx-auto flex w-full max-w-7xl flex-col lg:flex-row gap-12 px-6 py-16 lg:py-24 items-center min-h-[90vh]">
        <div className="flex-1 space-y-8 relative z-20">
          <div className="inline-block bg-black text-aldesYellow px-4 py-1.5 rounded-full font-black uppercase text-xs tracking-widest shadow-[4px_4px_0_0_#D52518]">
            Freshly Grilled Daily 🔥
          </div>
          <h1 className="text-[3.5rem] md:text-8xl font-black uppercase tracking-tighter leading-[0.9]">
            YOUR BURGER<br />
            <span className="text-aldesRed italic border-b-[8px] border-aldesRed pb-1">YOUR RULES.</span>
          </h1>
          <p className="text-xl font-bold text-gray-700 max-w-lg">
            Build every layer exactly how you like it. Extra cheese? No onions? Double patty? It's all in your hands.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button onClick={handleStartCustomizing} className="bg-aldesRed text-white px-8 py-4 rounded-2xl font-black uppercase text-lg shadow-[6px_6px_0_0_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000] active:translate-y-1 active:shadow-none transition-all border-4 border-black">
              Start Building
            </button>
            <button onClick={() => navigate('/menu')} className="bg-white px-8 py-4 rounded-2xl font-black uppercase text-lg shadow-[6px_6px_0_0_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000] active:translate-y-1 active:shadow-none transition-all border-4 border-black text-black">
              Explore Menu
            </button>
          </div>
        </div>

        {/* Live Preview Dummy */}
        <div className="flex-1 w-full flex justify-center relative z-10 mt-10 lg:mt-0">
          <div className="relative bg-white p-6 rounded-[2.5rem] border-[6px] border-black shadow-[15px_15px_0_0_#000] rotate-3 hover:rotate-0 transition-transform duration-500 max-w-md w-full">
             <img src={burgerImg} alt="Epic Burger" className="w-full object-cover rounded-[1.5rem] mb-6 border-4 border-black aspect-[4/3]" />
             <div className="space-y-3">
                {['Double Patty', 'No Onion', 'Extra Cheese'].map(item => (
                  <div key={item} className="flex items-center gap-2 font-black uppercase bg-aldesCream border-2 border-black/10 p-2.5 rounded-xl text-sm">
                    <CheckCircle2 className="text-green-600" size={18} /> {item}
                  </div>
                ))}
             </div>
             <div className="mt-5 pt-5 border-t-[3px] border-dashed border-black flex justify-between items-center font-black text-xl uppercase">
               <span>Est. Price</span>
               <span className="text-aldesRed italic text-2xl">Rp 59.000</span>
             </div>
          </div>
        </div>
      </section>

      {/* --- STICKY SCROLL PARALLAX SECTION (INTERAKTIF) --- */}
      <section ref={stickySectionRef} className="h-[200vh] w-full bg-aldesYellow border-y-[6px] border-black relative z-30">
        
        {/* Sticky Container yang mengunci seluruh konten agar tetap di viewport */}
        <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
          
          {/* Teks Petunjuk - Sekarang benar-benar diam di tengah/atas */}
          <div className="absolute top-[15%] text-center z-50 px-4 w-full">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black">
              See How It Comes Together
            </h2>
            <p className="mt-2 text-sm font-bold uppercase tracking-widest text-black/60">
              Scroll to assemble your master stack
            </p>
          </div>

          {/* Area Burger - Tetap di posisi yang sama meskipun progress scroll berjalan */}
          <div className="relative w-full h-[400px] max-w-2xl mt-16">
            
            {/* Price Tag muncul hanya jika progress sudah 1 (selesai) */}
            <div className={`absolute top-[10%] right-4 md:right-16 bg-white border-[4px] border-black px-5 py-3 rounded-2xl shadow-[6px_6px_0_0_#D52518] z-[60] transition-all duration-500 transform ${progress >= 0.9 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <p className="text-[10px] font-black uppercase text-gray-500">Your Masterpiece</p>
                <p className="text-2xl font-black italic text-black">Rp 58.000</p>
                <button onClick={handleStartCustomizing} className="mt-2 bg-aldesRed text-white text-xs px-3 py-1.5 rounded-lg border-2 border-black font-black uppercase w-full hover:bg-black transition-colors">Order Now</button>
            </div>

            {/* INGREDIENTS LAYERS */}
            {/* Gunakan CSS `transform` untuk menggerakkan bahan ke titik akhir (0,0) */}
            <img src={imgBottom} alt="Bottom Bun" className="absolute top-1/2 left-1/2 w-48 md:w-56 object-contain z-10 drop-shadow-2xl" 
                  style={getStyle(0, 150, 0, 0, 150, 0)} />

            <img src={imgBeef} alt="Patty" className="absolute top-1/2 left-1/2 w-48 md:w-56 object-contain z-20 drop-shadow-2xl" 
                  style={getStyle(-250, 150, -30, 0, 115, 0)} />

            <img src={imgCheese} alt="Cheese" className="absolute top-1/2 left-1/2 w-48 md:w-56 object-contain z-30 drop-shadow-2xl" 
                  style={getStyle(250, 80, 45, 0, 109, 0)} />

            <img src={imgLettuce} alt="Lettuce" className="absolute top-1/2 left-1/2 w-48 md:w-56 object-contain z-40 drop-shadow-2xl" 
                  style={getStyle(-200, 0, -20, 0, 79, 0)} />

            <img src={imgTomato} alt="Tomato" className="absolute top-1/2 left-1/2 w-48 md:w-56 object-contain z-40 drop-shadow-2xl" 
                  style={getStyle(200, -80, 60, 0, 82, 0)} />

            <img src={imgTop} alt="Top Bun" className="absolute top-1/2 left-1/2 w-48 md:w-56 object-contain z-50 drop-shadow-2xl" 
                  style={getStyle(0, -400, -15, 0, 58, 0)} />
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="bg-black text-white py-16 lg:py-24 border-b-[6px] border-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #D52518 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>
        <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-8 px-6 text-center relative z-10">
          {[
            { label: 'Burgers Built', val: '50K+' },
            { label: 'Avg Rating', val: '4.9★' },
            { label: 'Ingredients', val: '20+' },
            { label: 'Avg Delivery', val: '15m' }
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-4">
              <div className="text-4xl md:text-6xl font-black text-aldesYellow mb-2 drop-shadow-[2px_2px_0_#D52518]">{s.val}</div>
              <div className="text-xs md:text-sm uppercase font-bold tracking-widest text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* --- HOW IT WORKS (Timeline) --- */}
      <section className="bg-white py-24 px-6 border-b-[6px] border-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">How It Works</h2>
            <p className="mt-2 text-aldesRed font-bold uppercase tracking-widest text-sm">4 Steps to perfection</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-24 right-24 h-1 border-t-[4px] border-dashed border-black/20 z-0"></div>

            {[
              { num: 1, title: 'Choose Base', desc: 'Start with a signature menu or a blank canvas.', bg: 'bg-aldesCream' },
              { num: 2, title: 'Customize', desc: 'Add, remove, or double up any ingredients.', bg: 'bg-aldesYellow' },
              { num: 3, title: 'Checkout', desc: 'Review your crazy stack and complete payment.', bg: 'bg-aldesCream' },
              { num: 4, title: 'Delivered', desc: 'Hot, fresh, and exactly how you built it.', bg: 'bg-aldesRed', text: 'text-white' }
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                <div className={`w-24 h-24 ${step.bg} ${step.text || 'text-black'} border-[5px] border-black rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-[6px_6px_0_0_#000] mb-8 group-hover:-translate-y-2 group-hover:shadow-[10px_10px_0_0_#000] transition-all duration-300 rotate-3 group-hover:rotate-0`}>
                  {step.num}
                </div>
                <h3 className="text-2xl font-black uppercase mb-3 bg-white px-4 py-1.5 border-4 border-black rounded-lg shadow-[4px_4px_0_0_#000]">{step.title}</h3>
                <p className="text-gray-600 font-bold text-sm max-w-[200px] mt-2">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CAROUSEL REVIEWS --- */}
      <section className="bg-aldesCream py-24 px-6 border-b-[6px] border-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end border-b-[6px] border-dashed border-black pb-6 mb-12">
            <div>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-black">Loved by the Crowd</h2>
              <p className="mt-2 text-base font-bold uppercase tracking-widest text-aldesRed">Actual creations by our hungry customers.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {crazyStacks.map((t) => (
              <div key={t.id} className={`border-[6px] border-black rounded-[2.5rem] p-10 shadow-[12px_12px_0_0_#000] ${t.bgColor} ${t.textColor || 'text-black'} ${t.rotation} hover:rotate-0 hover:-translate-y-2 hover:shadow-[16px_16px_0_0_#000] transition-all duration-300`}>
                <div className="flex text-black mb-6 gap-1">
                  <Star className="fill-current w-6 h-6 drop-shadow-md" /><Star className="fill-current w-6 h-6 drop-shadow-md" /><Star className="fill-current w-6 h-6 drop-shadow-md" /><Star className="fill-current w-6 h-6 drop-shadow-md" /><Star className="fill-current w-6 h-6 drop-shadow-md" />
                </div>
                <p className="text-xl md:text-2xl font-black italic mb-8 leading-snug">"{t.review}"</p>
                <div className={`font-black uppercase text-sm border-t-[3px] ${t.textColor ? 'border-white/40' : 'border-black/20'} pt-4`}>
                  — Chef {t.creator}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- HUGE CTA SECTION --- */}
      <section className="py-24 px-6 text-center bg-white">
        <div className="bg-white max-w-4xl mx-auto p-12 md:p-20 rounded-[4rem] border-[8px] border-black shadow-[20px_20px_0_0_#D52518] relative overflow-hidden group">
          <div className="absolute inset-0 opacity-[0.05] transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: 'radial-gradient(#000 3px, transparent 3px)', backgroundSize: '40px 40px' }}></div>
          <div className="relative z-10">
            <h2 className="text-5xl md:text-[5.5rem] font-black uppercase tracking-tighter mb-6 leading-none">
              READY TO BUILD?
            </h2>
            <p className="text-xl md:text-2xl font-bold uppercase tracking-widest text-gray-500 mb-12">
              Fresh. Fast. Fully Yours.
            </p>
            <button onClick={handleStartCustomizing} className="inline-flex items-center gap-4 bg-aldesRed text-white px-10 py-5 rounded-2xl font-black uppercase text-xl md:text-3xl border-[6px] border-black shadow-[10px_10px_0_0_#000] hover:-translate-y-2 hover:shadow-[14px_14px_0_0_#000] active:translate-y-2 active:shadow-none transition-all">
              START YOUR MASTERPIECE <ArrowRight strokeWidth={4} className="w-8 h-8" />
            </button>
          </div>
        </div>
      </section>

    </main>
  )
}

export default LandingPage
import { ChefHat, Flame, Sliders, Star, Truck, Quote } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getToken } from '../utils/auth'

import burgerImg from '../assets/menus/1.png'

const steps = [
  {
    id: 1,
    title: 'Pick a Base',
    description: 'Start with beef, chicken, or a custom build as your burger foundation.',
    icon: ChefHat,
  },
  {
    id: 2,
    title: 'Enter the Kitchen',
    description: 'Add extra ingredients or remove anything with our universal modifier system.',
    icon: Sliders,
  },
  {
    id: 3,
    title: 'We Deliver',
    description: 'Our team grills fast and delivers hot burgers directly to your address.',
    icon: Truck,
  },
]

function LandingPage() {
  const navigate = useNavigate()
  const isAuthenticated = Boolean(getToken())

  // PERBAIKAN LOGIKA: Validasi untuk tombol Start Customizing
  const handleStartCustomizing = () => {
    if (isAuthenticated) {
      navigate('/menu')
    } else {
      navigate('/login')
    }
  }

  // PERBAIKAN LOGIKA: Validasi untuk tombol Track Orders / Login
  const handleTrackOrders = () => {
    if (isAuthenticated) {
      navigate('/transactions')
    } else {
      navigate('/login')
    }
  }

  return (
    <main className="bg-aldesCream text-black font-sans selection:bg-aldesRed selection:text-white pb-10">
      
      {/* HERO SECTION */}
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:pt-20">
        <div className="flex flex-col justify-center text-left">
          
          {/* Badge Atas */}
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-xl bg-aldesYellow border-3 border-black px-4 py-1.5 text-sm font-black uppercase tracking-wider text-black shadow-[3px_3px_0_0_#000]">
            <Flame className="h-4 w-4 text-aldesRed animate-pulse" /> Freshly grilled daily
          </div>
          
          <h1 className="text-5xl font-black tracking-tighter text-black sm:text-7xl lg:leading-[0.95] uppercase">
            Your Burger, <br />
            <span className="text-aldesRed italic bg-white border-4 border-black px-4 py-1 inline-block my-2 shadow-[6px_6px_0_0_#000] -rotate-1">Your Rules.</span>
          </h1>
          
          <p className="mt-6 max-w-xl text-lg font-bold leading-relaxed text-black/80 sm:text-xl uppercase tracking-wide">
            Build every layer exactly how you like it—extra cheese, no onions, double patty, <span className="underline decoration-aldesRed decoration-4">zero compromise.</span>
          </p>
          
          {/* Tombol Aksi */}
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={handleStartCustomizing}
              className="group flex cursor-pointer items-center justify-center rounded-2xl bg-aldesRed text-aldesYellow border-[4px] border-black px-8 py-4 font-black uppercase text-xl shadow-[0_8px_0_0_#000] hover:-translate-y-1 hover:shadow-[0_12px_0_0_#000] active:translate-y-2 active:shadow-[0_4px_0_0_#000] transition-all duration-200"
            >
              Start Customizing
            </button>
            <button
              onClick={handleTrackOrders}
              className="flex cursor-pointer items-center justify-center rounded-2xl border-[4px] border-black bg-white px-8 py-4 font-black uppercase text-xl text-black shadow-[0_8px_0_0_#000] hover:bg-gray-50 hover:-translate-y-1 hover:shadow-[0_12px_0_0_#000] active:translate-y-2 active:shadow-[0_4px_0_0_#000] transition-all duration-200"
            >
              {isAuthenticated ? 'Track Orders' : 'Login to Track'}
            </button>
          </div>
        </div>

        {/* HERO IMAGE CONTAINER */}
        <div className="relative rounded-[2.5rem] border-[6px] border-black overflow-hidden bg-white shadow-[12px_12px_0_0_#000] aspect-[4/3] lg:aspect-auto transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[18px_18px_0_0_#000] transition-all duration-300">
          <img
            src={burgerImg}
            alt="Epic burger hero"
            className="h-full w-full object-cover pointer-events-none"
          />
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[3rem] bg-white border-[6px] border-black p-8 shadow-[12px_12px_0_0_#000] sm:p-12 text-left">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tight text-black">The Universal Kitchen</h2>
            <p className="mt-3 text-lg font-bold uppercase tracking-wide text-black/70">
              Every ingredient can be modified as <span className="bg-green-200 border-2 border-black px-2 py-0.5 rounded-lg text-black font-black mx-1">ADD</span> (extra) or <span className="bg-red-200 border-2 border-black px-2 py-0.5 rounded-lg text-black font-black mx-1">REMOVE</span> (no ingredient).
            </p>
          </div>
          
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* Hover Interaksi ditambahkan ke masing-masing kartu fitur */}
            <article className="rounded-2xl border-4 border-black bg-aldesCream/40 p-6 shadow-[4px_4px_0_0_#000] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000] transition-all duration-200">
              <div className="mb-4 inline-flex rounded-xl border-3 border-black bg-aldesYellow p-3 shadow-[2px_2px_0_0_#000]">
                <ChefHat className="h-7 w-7 text-black stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-black">Chef-ready</h3>
              <p className="mt-2 text-base font-bold text-black/70 leading-normal">Your notes are clear for kitchen staff with structured modifiers.</p>
            </article>

            <article className="rounded-2xl border-4 border-black bg-aldesCream/40 p-6 shadow-[4px_4px_0_0_#000] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000] transition-all duration-200">
              <div className="mb-4 inline-flex rounded-xl border-3 border-black bg-aldesYellow p-3 shadow-[2px_2px_0_0_#000]">
                <Sliders className="h-7 w-7 text-black stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-black">Flexible Controls</h3>
              <p className="mt-2 text-base font-bold text-black/70 leading-normal">No tomato? Extra cheese? One tap and your recipe updates instantly.</p>
            </article>

            <article className="rounded-2xl border-4 border-black bg-aldesCream/40 p-6 shadow-[4px_4px_0_0_#000] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000] transition-all duration-200">
              <div className="mb-4 inline-flex rounded-xl border-3 border-black bg-aldesYellow p-3 shadow-[2px_2px_0_0_#000]">
                <Flame className="h-7 w-7 text-black stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-black">Always Fresh</h3>
              <p className="mt-2 text-base font-bold text-black/70 leading-normal">We grill to order so every bite is hot, juicy, and made for you.</p>
            </article>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-center md:text-left">
        <div className="border-b-[6px] border-dashed border-black pb-6 mb-12">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black">How It Works</h2>
          <p className="mt-2 text-sm font-bold uppercase tracking-widest text-black/50">Three simple steps to your perfect meal.</p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3 pt-4">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              /* Hover Interaksi pada langkah proses */
              <article key={step.id} className="relative rounded-[2rem] border-4 border-black bg-white p-8 shadow-[6px_6px_0_0_#000] text-left hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#000] transition-all duration-200">
                {/* Badge Ikon */}
                <div className="absolute -top-6 left-8 inline-flex h-12 w-12 items-center justify-center rounded-xl border-3 border-black bg-aldesYellow text-black shadow-[3px_3px_0_0_#000] -rotate-3">
                  <Icon className="h-6 w-6 stroke-[2.5]" />
                </div>
                <h3 className="mt-4 text-2xl font-black uppercase tracking-tight text-black">
                  <span className="text-aldesRed italic mr-1">{step.id}.</span> {step.title}
                </h3>
                <p className="mt-3 text-base font-bold text-black/60 leading-relaxed">{step.description}</p>
              </article>
            )
          })}
        </div>
      </section>

      {/* TESTIMONIAL SECTION */}
      <section className="mx-auto w-full max-w-4xl px-4 pb-12 pt-10 sm:px-6 lg:px-8">
        <article className="relative overflow-hidden rounded-[3rem] border-[6px] border-black bg-white p-8 text-center shadow-[12px_12px_0_0_#000] sm:p-14 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[16px_16px_0_0_#000] transition-all duration-300">
          <Quote className="absolute -left-6 -top-6 h-36 w-36 rotate-12 text-aldesCream/50 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-1 text-aldesYellow">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className="p-0.5 bg-black rounded-md border border-black mx-0.5 shadow-[1px_1px_0_0_#000]">
                  <Star className="h-5 w-5 fill-current text-aldesYellow" />
                </div>
              ))}
            </div>
            
            <p className="mt-8 text-xl font-black italic uppercase tracking-tight leading-relaxed text-black sm:text-2xl">
              “Aldes Burger is my go-to app. I can remove what I don’t like and add what I love. Super easy and always delicious!”
            </p>
            
            <div className="mt-8 flex items-center gap-4 bg-aldesCream/30 border-3 border-black px-5 py-3 rounded-2xl shadow-[4px_4px_0_0_#000]">
              <div className="h-12 w-12 rounded-xl bg-aldesRed border-3 border-black flex items-center justify-center font-black text-xl text-aldesYellow shadow-[2px_2px_0_0_#000]">
                R
              </div>
              <div className="text-left">
                <p className="text-lg font-black uppercase tracking-tight text-black leading-none">Rachel</p>
                <p className="text-xs font-bold uppercase tracking-wider text-black/50 mt-1">Jakarta, Indonesia</p>
              </div>
            </div>
          </div>
        </article>
      </section>

    </main>
  )
}

export default LandingPage
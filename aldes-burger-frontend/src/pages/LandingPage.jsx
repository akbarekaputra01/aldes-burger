import { useState, useEffect, useRef } from 'react'
import { ChefHat, Flame, ArrowRight, Sliders, Truck, Star, CheckCircle2, ChevronDown, Sparkles, ShoppingBag, Clock } from 'lucide-react'
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

// --- TESTIMONIAL DATA WITH CUSTOM ORDER DETAILS ---
const customerReviews = [
  {
    id: 1,
    name: "Alex Johnson",
    stack: "Custom: Double Beef + Cheddar Cheese + Secret Sauce",
    comment: "Absolutely incredible! The burger arrived piping hot and the cheese was perfectly melted on the first bite. Will definitely customize my recipe again next week.",
    rating: 5,
    time: "30 Mins Delivery"
  },
  {
    id: 2,
    name: "Clarissa Vance",
    stack: "Custom: Crispy Chicken + Pickles + Cheddar Cheese + Ketchup",
    comment: "As someone who hates onions, this custom builder is a lifesaver. Delivery was incredibly fast and the chicken patty was still super crispy!",
    rating: 5,
    time: "32 Mins Delivery"
  },
  {
    id: 3,
    name: "Ryan Gallagher",
    stack: "Preset: Beef Burger + No Onion",
    comment: "The Secret sauce really brings the heat! The beef patty was thick, rich, and juicy. Neatly packed so nothing fell apart during transit.",
    rating: 5,
    time: "28 Mins Delivery"
  }
]

function LandingPage() {
  const navigate = useNavigate()
  const isAuthenticated = Boolean(getToken())

  // STATE & REF FOR BURGER STACK ANIMATION (UNTOUCHED)
  const [progress, setProgress] = useState(0)
  const stickySectionRef = useRef(null)

  // STATE FOR TESTIMONIAL SLIDER
  const [activeReview, setActiveReview] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!stickySectionRef.current) return
      
      const offsetTop = stickySectionRef.current.offsetTop
      const height = stickySectionRef.current.offsetHeight
      const windowHeight = window.innerHeight
      
      const start = offsetTop - 80
      const end = start + height - windowHeight
      
      let p = (window.scrollY - start) / (end - start)
      
      p = Math.max(0, Math.min(p, 1))
      setProgress(p)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const getStyle = (sx, sy, sr, ex, ey, er) => {
    const currentX = sx + (ex - sx) * progress
    const currentY = sy + (ey - sy) * progress
    const currentRot = sr + (er - sr) * progress
    
    return {
      transform: `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px)) rotate(${currentRot}deg)`,
      transition: 'transform 0.1s ease-out'
    }
  }

  const handleStartCustomizing = () => {
    if (isAuthenticated) navigate('/menu')
    else navigate('/login')
  }

  return (
    <main className="bg-aldesCream text-black selection:bg-aldesRed selection:text-white">
      
      {/* --- HERO SECTION (STATIS & CLEAN) - UNTOUCHED --- */}
      <section className="relative mx-auto flex w-full max-w-7xl flex-col lg:flex-row gap-12 px-6 py-16 lg:py-24 items-center min-h-[90vh]">
        <div className="flex-1 space-y-8 relative z-20">
          <div className="inline-block bg-black text-aldesYellow px-4 py-1.5 rounded-full font-black uppercase text-xs tracking-widest shadow-[4px_4px_0_0_#D52518]">
            Freshly Grilled Daily 🔥
          </div>
          <h1 className="text-[3.5rem] md:text-8xl font-black uppercase tracking-tighter leading-[1.05]">
            YOUR BURGER<br />
            <span className="text-aldesRed italic border-b-[8px] border-aldesRed pb-1">YOUR RULES.</span>
          </h1>
          <p className="text-xl font-bold text-gray-700 max-w-lg pt-6">
            Build every layer exactly how you like it. Extra cheese? No onions? Double patty? It's all in your hands.
          </p>
          <div className="flex flex-wrap gap-4">
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

      {/* --- STICKY SCROLL PARALLAX SECTION (SWISS CHEESE TEXTURE) - UNTOUCHED --- */}
      <section ref={stickySectionRef} className="h-[200vh] w-full bg-aldesYellow border-y-[6px] border-black relative z-30">
        
        {/* SWISS CHEESE VECTOR TEXTURE BACKGROUND */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.25]" style={{
          backgroundImage: `
            radial-gradient(circle at 15% 20%, #e6b219 40px, transparent 41px),
            radial-gradient(circle at 85% 15%, #e6b219 55px, transparent 56px),
            radial-gradient(circle at 50% 45%, #e6b219 30px, transparent 31px),
            radial-gradient(circle at 10% 75%, #e6b219 60px, transparent 61px),
            radial-gradient(circle at 90% 80%, #e6b219 45px, transparent 46px),
            radial-gradient(circle at 70% 60%, #e6b219 35px, transparent 36px),
            radial-gradient(circle at 30% 90%, #e6b219 50px, transparent 51px)
          `,
          backgroundSize: '100% 100%'
        }} />

        <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute top-[20%] text-center z-50 px-4 w-full">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black">
              See How It Comes Together
            </h2>
            <p className="mt-2 text-sm font-bold uppercase tracking-widest text-black/60">
              Scroll to assemble your master stack
            </p>
          </div>

          <div className="relative w-full h-[400px] max-w-2xl mt-16">
            <div className={`absolute top-[17%] right-4 md:right-16 bg-white border-[4px] border-black px-5 py-3 rounded-2xl shadow-[6px_6px_0_0_#D52518] z-[60] transition-all duration-500 transform ${progress >= 0.9 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <p className="text-[10px] font-black uppercase text-gray-500">Your Masterpiece</p>
                <p className="text-2xl font-black italic text-black">Rp 36.500</p>
                <button onClick={handleStartCustomizing} className="mt-2 bg-aldesRed text-white text-xs px-3 py-1.5 rounded-lg border-2 border-black font-black uppercase w-full hover:bg-black transition-colors">Order Now</button>
            </div>

            {/* INGREDIENTS LAYERS */}
            <img src={imgBottom} alt="Bottom Bun" className="absolute top-1/2 left-1/2 w-48 md:w-56 object-contain z-10 drop-shadow-2xl" style={getStyle(0, 150, 0, 0, 150, 0)} />
            <img src={imgBeef} alt="Patty" className="absolute top-1/2 left-1/2 w-48 md:w-56 object-contain z-20 drop-shadow-2xl" style={getStyle(-250, 150, -30, 0, 115, 0)} />
            <img src={imgCheese} alt="Cheese" className="absolute top-1/2 left-1/2 w-48 md:w-56 object-contain z-30 drop-shadow-2xl" style={getStyle(250, 80, 45, 0, 109, 0)} />
            <img src={imgLettuce} alt="Lettuce" className="absolute top-1/2 left-1/2 w-48 md:w-56 object-contain z-40 drop-shadow-2xl" style={getStyle(-200, 0, -20, 0, 79, 0)} />
            <img src={imgTomato} alt="Tomato" className="absolute top-1/2 left-1/2 w-48 md:w-56 object-contain z-40 drop-shadow-2xl" style={getStyle(200, -80, 60, 0, 82, 0)} />
            <img src={imgTop} alt="Top Bun" className="absolute top-1/2 left-1/2 w-48 md:w-56 object-contain z-50 drop-shadow-2xl" style={getStyle(0, -330, -15, 0, 58, 0)} />
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS (CLEAN & PROFESSIONAL ENGLISH CONTEXT) --- */}
      <section className="bg-white py-24 px-6 border-b-[6px] border-black relative z-40">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-20 space-y-3">
            <div className="inline-flex items-center gap-2 bg-aldesYellow border-2 border-black px-4 py-1 rounded-full font-black text-xs uppercase tracking-wider">
              <Truck size={14} /> Fresh Kitchen Logistics
            </div>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
              FROM KITCHEN TO YOUR DOORSTEP
            </h2>
            <p className="text-gray-500 font-bold max-w-xl mx-auto text-sm">
              See exactly how your custom burger goes from our grills straight to your hands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: <Sliders size={28} />, title: "1. Design Your Order", desc: "Pick your base canvas, stack your favorite patties, cheese types, and signature house sauces inside the builder." },
              { icon: <ChefHat size={28} />, title: "2. Grilled on Demand", desc: "Our chefs immediately grill your premium beef patties over an open flame according to your exact specifications." },
              { icon: <ShoppingBag size={28} />, title: "3. Heat-Sealed Packing", desc: "Your burger is packed into dedicated insulative foils to fully preserve the warmth and melted cheese texture." },
              { icon: <Truck size={28} />, title: "4. Fast Dispatch", desc: "Our delivery network is dispatched to get your order to your physical location in under 30 minutes." }
            ].map((step, i) => (
              <div key={i} className="bg-aldesCream border-[4px] border-black p-6 rounded-2xl shadow-[5px_5px_0_0_#000] flex flex-col justify-between hover:-translate-y-1 transition-transform group">
                <div>
                  <div className="w-14 h-14 bg-black text-aldesYellow border-2 border-black rounded-xl flex items-center justify-center mb-6 shadow-[3px_3px_0_0_#D52518] group-hover:bg-aldesRed group-hover:text-white transition-colors">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-black uppercase mb-3 border-b-2 border-black/10 pb-2 tracking-tight">{step.title}</h3>
                  <p className="text-gray-600 font-bold text-xs leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* --- DELIVERY RECEIPT REVIEWS (CLEAN RETRO STYLE) --- */}
      <section className="bg-aldesRed py-24 px-6 border-b-[6px] border-black relative z-40 overflow-hidden">
        
        {/* Subtle Dots Background */}
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle, #fff 2.5px, transparent 2.5px)', backgroundSize: '30px 30px' }} />

        <div className="max-w-4xl mx-auto relative z-10">
          
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white drop-shadow-[4px_4px_0_#000]">
              WHAT THEY SAY ABOUT US
            </h2>
            <p className="text-aldesYellow font-black text-sm uppercase tracking-wider">
              Real community feedback from our custom burger architects
            </p>
          </div>

          {/* RECEIPT BOX ACCORDION TICKET */}
          <div className="bg-white border-[6px] border-black rounded-2xl p-6 md:p-10 shadow-[12px_12px_0_0_#000] relative border-t-[14px] border-t-black">
            
            {/* Top Bar Receipt Info */}
            <div className="flex justify-between items-center border-b-2 border-dashed border-black pb-4 mb-6 text-xs font-mono font-black text-gray-400">
              <span>ORDER VERIFIED ✔</span>
              <span className="flex items-center gap-1"><Clock size={12} /> {customerReviews[activeReview].time}</span>
            </div>

            {/* Main Content Review */}
            <div className="space-y-4">
              <div className="flex items-center gap-1 text-aldesYellow">
                {Array(customerReviews[activeReview].rating).fill(null).map((_, i) => (
                  <Star key={i} size={20} className="fill-current text-black" />
                ))}
              </div>

              <div className="text-[11px] font-mono uppercase bg-aldesCream p-2 rounded border border-black/10 text-gray-600 font-black">
                {customerReviews[activeReview].stack}
              </div>

              <p className="text-lg md:text-xl font-bold text-gray-800 italic leading-relaxed pt-2">
                "{customerReviews[activeReview].comment}"
              </p>
              
              <div className="pt-4 font-black text-base uppercase text-aldesRed">
                — {customerReviews[activeReview].name}
              </div>
            </div>

            {/* Pagination Selector Buttons */}
            <div className="flex justify-center items-center gap-3 mt-10 pt-6 border-t border-black/10">
              {customerReviews.map((rev, idx) => (
                <button 
                  key={rev.id}
                  onClick={() => setActiveReview(idx)}
                  className={`h-4 border-2 border-black transition-all ${activeReview === idx ? 'w-10 bg-black' : 'w-4 bg-gray-200'}`}
                  title={`See review from ${rev.name}`}
                />
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* --- CLEAN & JUICY DELIVERY HERO CTA --- */}
      <section className="bg-aldesYellow py-32 px-6 text-center relative z-40 border-t-2 border-black">
        <div className="max-w-2xl mx-auto space-y-6">
          
          <div className="inline-block bg-black text-white px-4 py-1.5 rounded-full border-2 border-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0_0_#D52518]">
            🔥 Hunger Alert Sequence Detected
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-black">
            SERVED HOT. <br />
            <span className="text-aldesRed italic drop-shadow-[4px_4px_0_#fff]">DELIVERED FAST.</span>
          </h2>
          
          <p className="text-sm md:text-lg font-bold text-black/70 max-w-md mx-auto leading-relaxed">
            Thick juicy patties, melted cheddar blankets, and your customized signature ingredients delivered fresh to your doorstep right now.
          </p>
          
          <div className="pt-4">
            <button 
              onClick={handleStartCustomizing} 
              className="inline-flex items-center gap-3 bg-black text-aldesYellow px-10 py-5 rounded-2xl font-black uppercase text-lg md:text-2xl border-4 border-black shadow-[8px_8px_0_0_#D52518] hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#000] active:translate-y-1 active:shadow-none transition-all duration-150"
            >
              <span>ORDER NOW</span>
              <ArrowRight strokeWidth={4} size={22} />
            </button>
          </div>

        </div>
      </section>

    </main>
  )
}

export default LandingPage
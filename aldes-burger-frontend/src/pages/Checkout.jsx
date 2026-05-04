import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TicketPercent, MapPin, CreditCard, ShoppingBag, Plus, Minus, Trash2, Sparkles } from 'lucide-react';
import MascotBurger from '../assets/mascot-burger.png'; // Pastikan path asset benar

// --- KOMPONEN KECIL UNTUK VIBES KONSISTEN ---

// Icon Burger Kecil Gaya Neubrutalism - Disesuaikan konsistensinya
const BurgerIconSmall = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 11a8 8 0 0 1 16 0" /><path d="M2 15h20" /><path d="M4 15a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4" /><path d="M2 12h20" />
  </svg>
);

// --- DATA DUMMY CART ---
const initialCart = [
  { id: 1, name: 'Aldes OG Burger', price: 45000, qty: 1, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop' },
  { id: 2, name: 'Cheese Overload', price: 55000, qty: 2, image: 'https://images.unsplash.com/photo-1550317138-10000687a72b?q=80&w=400&auto=format&fit=crop' },
];

function Checkout() {
  const [cart, setCart] = useState(initialCart);
  const [promo, setPromo] = useState('');

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
  };

  const calculateSubtotal = () => cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const subtotal = calculateSubtotal();
  const deliveryFee = subtotal > 100000 ? 0 : 15000;
  const platformFee = 2000;
  const total = subtotal + deliveryFee + platformFee;

  return (
    <main className="min-h-screen w-full bg-[#F3E8CC] font-sans overflow-x-hidden relative text-[15px]">
      
      {/* HEADER SECTION - KONSISTEN & BERSIH */}
      <header className="w-full bg-white border-b-[6px] border-black px-4 md:px-8 py-4 sticky top-0 z-50 shadow-[0_4px_0_0_#000]">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
            <Link to="/menu" className="flex items-center gap-2.5 bg-[#F3E8CC]/50 border-4 border-black px-5 py-2 rounded-full font-black shadow-[4px_4px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all text-xs uppercase tracking-wider group">
              <ArrowLeft className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform" strokeWidth={3} />
              Back
            </Link>
            
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black uppercase italic tracking-tighter text-black drop-shadow-[2px_2px_0_#FFC926]">
                Secure the Bag
              </h1>
              <ShoppingBag size={28} className="text-[#D52518]" strokeWidth={3}/>
            </div>

            <Link to="/profile" className="w-12 h-12 rounded-full border-4 border-black overflow-hidden shadow-[4px_4px_0_0_#000]">
              <img src={MascotBurger} alt="User" className="w-full h-full object-cover bg-[#FFC926]" />
            </Link>
        </div>
      </header>

      {/* MAIN CONTENT AREA - PADDING UTAMA */}
      <div className="max-w-[1400px] mx-auto p-4 md:p-8">
        
        {/* GRID LAYOUT - Dua Kolom yang Jelas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          
          {/* KOLOM KIRI: CART & PROMO */}
          <section className="lg:col-span-2 space-y-8">
            <div className="bg-white border-[6px] border-black rounded-[2.5rem] p-6 md:p-8 shadow-[12px_12px_0_0_#000]">
              
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-4 border-black/10">
                <BurgerIconSmall size={24} className="text-[#D52518]" />
                <h2 className="text-3xl font-black uppercase tracking-tighter">Your Munchies Loot</h2>
                <span className="ml-auto font-black text-sm bg-black text-[#F3E8CC] px-4 py-1.5 rounded-full">{cart.length} Items</span>
              </div>

              {/* CART ITEMS - KONSISTEN DENGAN FIELD INPUT */}
              <div className="space-y-5">
                {cart.map(item => (
                  <div key={item.id} className="flex flex-col sm:flex-row items-center gap-5 bg-white border-4 border-black rounded-2xl p-5 shadow-[4px_4px_0_0_#000] group transition-all hover:translate-x-[-2px] hover:translate-y-[-2px]">
                    <img src={item.image} alt={item.name} className="w-24 h-24 rounded-xl border-4 border-black object-cover shadow-[4px_4px_0_0_#000] bg-[#F3E8CC]/50" />
                    
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-2xl font-black uppercase tracking-tight leading-none mb-1 group-hover:text-[#D52518]">{item.name}</h3>
                      <p className="font-bold text-lg text-black bg-[#F3E8CC] px-3 py-1 rounded-full inline-block">Rp {item.price.toLocaleString('id-ID')}</p>
                    </div>

                    {/* QTY CONTROLS - KONSISTEN DENGAN LOGIN BUTTON STYLE */}
                    <div className="flex items-center gap-1 bg-white border-4 border-black rounded-full p-1 shadow-[4px_4px_0_0_#000]">
                      <button onClick={() => updateQty(item.id, -1)} className="w-10 h-10 flex items-center justify-center text-[#D52518] hover:scale-110 active:scale-95"><Minus size={18} strokeWidth={4}/></button>
                      <span className="font-black text-2xl text-black w-14 text-center tabular-nums">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-10 h-10 flex items-center justify-center text-[#D52518] hover:scale-110 active:scale-95"><Plus size={18} strokeWidth={4}/></button>
                    </div>

                    <div className="text-center sm:text-right flex flex-row sm:flex-col items-center gap-2">
                       <p className="font-black text-2xl tabular-nums text-black">Rp {(item.price * item.qty).toLocaleString('id-ID')}</p>
                       <button className="text-gray-400 hover:text-[#D52518] hover:scale-110 transition-all"><Trash2 size={22} strokeWidth={3}/></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* PROMO CODE SECTION - KONSISTEN DENGAN FIELD INPUT LOGIN */}
              <div className="mt-8 pt-6 border-t-4 border-black/10">
                <label className="block font-black text-xs uppercase tracking-wider mb-2.5 ml-3 text-[#D52518]"> flex your code here </label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 flex items-center bg-[#F3E8CC]/10 border-4 border-black rounded-full px-5 py-3.5 focus-within:bg-white focus-within:shadow-[4px_4px_0_0_#000] transition-all">
                    <TicketPercent size={24} className="text-black mr-3" />
                    <input type="text" value={promo} onChange={(e) => setPromo(e.target.value)} className="bg-transparent w-full outline-none font-bold text-lg uppercase placeholder:text-gray-400 placeholder:normal-case" placeholder="Type here..." />
                  </div>
                  <button className="bg-[#FFC926] text-black px-12 py-4 rounded-full border-4 border-black font-black text-lg uppercase tracking-tight shadow-[6px_6px_0_0_#000] hover:translate-y-1 hover:shadow-[3px_3px_0_0_#000] active:translate-y-2 active:shadow-none transition-all">Apply</button>
                </div>
              </div>
            </div>
          </section>

          {/* KOLOM KANAN: PAYMENT & FINAL SUMMARY */}
          <aside className="space-y-8">
            
            {/* DROP POINT & PAYMENT SELECTOR */}
            <div className="bg-white border-[6px] border-black rounded-[2.5rem] p-6 shadow-[12px_12px_0_0_#000]">
              
              {/* Delivery */}
              <div className="mb-6 pb-5 border-b-4 border-black/10">
                <div className="flex items-center gap-2.5 mb-4">
                  <MapPin size={24} className="text-[#D52518]" strokeWidth={3}/>
                  <h3 className="text-2xl font-black uppercase tracking-tight">Drop Point</h3>
                </div>
                <div className="bg-white border-4 border-black rounded-xl p-4 shadow-[4px_4px_0_0_#000] flex items-center gap-4 transition-all hover:bg-[#F3E8CC]/20 hover:border-[#D52518]">
                  <div className='flex-1'>
                      <p className="font-black text-lg mb-0.5">Rumah Skena Pusat</p>
                      <p className="text-xs font-medium text-gray-700">Jl. Burger Raya No. 42, Jaksel</p>
                  </div>
                  <span className='font-black text-xs bg-black text-[#F3E8CC] px-3 py-1 rounded-full uppercase cursor-pointer hover:bg-[#D52518] transition-colors'>Change</span>
                </div>
              </div>

              {/* Payment */}
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <CreditCard size={24} className="text-[#D52518]" strokeWidth={3}/>
                  <h3 className="text-2xl font-black uppercase tracking-tight">Payment</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {['QRIS', 'AldesPay'].map((method, idx) => (
                    <button key={method} className={`border-4 border-black rounded-xl p-4 font-black text-base uppercase tracking-tight shadow-[4px_4px_0_0_#000] transition-all flex flex-col items-center gap-2 ${idx === 0 ? 'bg-[#FFC926]' : 'bg-white hover:bg-[#F3E8CC]/50 hover:border-[#D52518]'}`}>
                      {idx === 0 ? <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/QRIS_logo.svg" alt="QRIS" className="h-6" /> : <BurgerIconSmall className="text-[#D52518]"/>}
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* FINAL SUMMARY & ORDER BUTTON - KONSISTEN DENGAN SIDE PANEL LOGIN */}
            <div className="bg-white border-[6px] border-black rounded-[2.5rem] p-8 shadow-[12px_12px_0_0_#000] relative overflow-hidden">
              
              <Sparkles size={80} className="absolute -bottom-8 -left-8 text-[#FFC926]/20 rotate-12" />
              
              <h3 className="text-3xl font-black uppercase tracking-tighter mb-6 pb-3 border-b-4 border-black/10 text-center relative z-10 text-black">Damage Report</h3>
              
              <div className="space-y-3 font-bold tabular-nums relative z-10 text-sm">
                <div className="flex justify-between text-black/80"><span>Munchies Subtotal</span><span className='font-black'>Rp {subtotal.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between text-black/80"><span>Skena Delivery</span><span className='font-black'>{deliveryFee === 0 ? <span className="text-[#D52518] font-black uppercase tracking-wider">FREE</span> : `Rp ${deliveryFee.toLocaleString('id-ID')}`}</span></div>
                <div className="flex justify-between text-black/80"><span>Platform Fee</span><span className='font-black'>Rp {platformFee.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between text-2xl font-black uppercase tracking-tight pt-4 mt-2 border-t-4 border-black/10 text-black">
                  <span>Total</span>
                  <span className="text-3xl text-black drop-shadow-[2px_2px_0_#FFC926]">Rp {total.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <button className="w-full mt-8 bg-[#D52518] text-[#FFC926] py-5 rounded-2xl border-[5px] border-black font-black text-2xl uppercase tracking-tighter shadow-[0_8px_0_0_#000] hover:translate-y-1 hover:shadow-[0_4px_0_0_#000] active:translate-y-2 active:shadow-none transition-all flex justify-center items-center gap-3 relative z-10 active:scale-[0.98]">
                ORDER NOW! 🔥
              </button>
            </div>
          </aside>
        </div>

        {/* FOOTER KECIL - KONSISTEN DENGAN LOGIN FOOTER */}
        <footer className="mt-12 text-center font-black text-xs text-gray-400 uppercase tracking-[0.3em] bg-black px-6 py-3 rounded-full inline-block mx-auto transform translate-x-[calc(50vw-50%)]">
          Aldes Burger © 2026 • Taste the Skena
        </footer>
      </div>

      {/* GLOBAL NEUBRUTALISM STYLES - KONSISTEN */}
      <style>{`
        /* Custom Scrollbar Brutalist */
        ::-webkit-scrollbar { width: 12px; }
        ::-webkit-scrollbar-track { background: #F3E8CC; border-left: 2px solid black; }
        ::-webkit-scrollbar-thumb { background: black; border: 2px solid #F3E8CC; border-radius: 6px; }
        ::-webkit-scrollbar-thumb:hover { background: #D52518; }
      `}</style>
    </main>
  );
}

export default Checkout;
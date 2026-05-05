import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  ShoppingBag,
  CheckCircle2,
  Banknote,
  Landmark,
  Flame,
  Info,
  User,
  Phone,
  Plus,
  Minus,
  Trash2
} from 'lucide-react';
import MascotBurger from '../assets/mascot-burger.png';
import { useCart } from '../context/CartContext'; // Import context keranjang

function Checkout() {
  const navigate = useNavigate();
  
  // 1. MENGAMBIL DATA DAN FUNGSI DARI CART CONTEXT
  const { cart, updateQty, removeFromCart, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('bank');

  // Kalkulasi Harga (Menggunakan unit_price sesuai standar CartContext)
  const subtotal = cart.reduce((sum, item) => sum + ((item.unit_price ?? 0) * (item.qty ?? 1)), 0);
  
  // Biaya pengiriman gratis jika di atas 100rb, tapi jika 0 (kosong) jangan tampilkan biaya
  const deliveryFee = subtotal > 100000 || subtotal === 0 ? 0 : 15000;
  const platformFee = subtotal === 0 ? 0 : 2000;
  const total = subtotal + deliveryFee + platformFee;

  // Fungsi Handle Checkout
  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    
    // Logika setelah klik order (misal: kirim ke API atau WA)
    alert("Order Berhasil Ditempatkan!");
    clearCart(); // Bersihkan cart menggunakan fungsi dari context
    navigate('/payment-status?status=success'); // Pindah ke page sukses yang sesuai dengan App.jsx
  };

  return (
    <main className="min-h-screen w-full bg-[#F3E8CC] font-sans text-black selection:bg-[#FFC926] overflow-x-hidden">
             
      {/* MARQUEE */}
      <div className="bg-black text-[#FFC926] py-1.5 overflow-hidden border-b-2 border-black">
        <div className="flex animate-marquee whitespace-nowrap font-bold text-[10px] uppercase tracking-[0.3em]">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="mx-6 italic">  ALDES BURGER   BEST TASTE IN TOWN   GEN-Z VIBES  </span>
          ))}
        </div>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full bg-white/60 backdrop-blur-lg border-b-2 border-black px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/cart" className="group flex items-center gap-2 bg-white border-2 border-black px-5 py-2 rounded-xl font-bold shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-[10px] uppercase tracking-wider">
            <ArrowLeft size={16} strokeWidth={3} /> Cart
          </Link>
          <div className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-xl border-2 border-black shadow-[4px_4px_0_0_#D52518]">
            <ShoppingBag size={18} className="text-[#FFC926]" strokeWidth={2.5} />
            <h1 className="text-lg font-black uppercase italic tracking-tight">Checkout</h1>
          </div>
          <div className="w-12 h-12 rounded-xl border-2 border-black bg-[#FFC926] p-1 shadow-[4px_4px_0_0_#000]">
            <img src={MascotBurger} alt="Mascot" className="w-full h-full object-contain" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                     
          {/* LIST PESANAN */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-end gap-3">
              <h2 className="text-3xl font-black uppercase italic leading-none text-black">Order Summary</h2>
              <div className="h-1 flex-1 bg-black/5 mb-1 rounded-full"></div>
              <span className="bg-[#FFC926] border-2 border-black px-4 py-1 rounded-lg font-black text-[10px] uppercase">
                {cart.length} Items
              </span>
            </div>

            <div className="space-y-4">
              {cart.length > 0 ? (
                cart.map(item => (
                  <div key={item.id} className="bg-white border-2 border-black rounded-[1.5rem] p-5 shadow-[6px_6px_0_0_#000] flex flex-col md:flex-row items-center gap-6">
                    <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-xl border-2 border-black overflow-hidden flex-shrink-0 shadow-[4px_4px_0_0_#F3E8CC]">
                      {/* Diberi fallback ke MascotBurger karena context belum menyimpan image item */}
                      <img src={item.image || MascotBurger} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                                         
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="font-black text-xl uppercase tracking-tight">{item.name}</h3>
                      <p className="font-bold text-[#D52518] italic text-sm mb-3">IDR {(item.unit_price ?? 0).toLocaleString('id-ID')}</p>
                                             
                      <div className="flex items-center justify-center md:justify-start gap-3">
                        <div className="flex items-center bg-[#F3E8CC]/50 border-2 border-black rounded-lg p-0.5">
                          <button onClick={() => updateQty(item.id, (item.qty ?? 1) - 1)} className="p-1.5 hover:bg-[#FFC926] rounded-md transition-colors"><Minus size={14} strokeWidth={4}/></button>
                          <span className="font-black text-center w-8 text-xs">{item.qty ?? 1}</span>
                          <button onClick={() => updateQty(item.id, (item.qty ?? 1) + 1)} className="p-1.5 hover:bg-[#FFC926] rounded-md transition-colors"><Plus size={14} strokeWidth={4}/></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-[#D52518] transition-colors p-1"><Trash2 size={18}/></button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-xl italic tabular-nums">IDR {((item.unit_price ?? 0) * (item.qty ?? 1)).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white border-2 border-black rounded-[1.5rem] p-12 text-center shadow-[6px_6px_0_0_#000]">
                  <p className="font-black uppercase italic text-gray-400">Empty!</p>
                  <Link to="/menu" className="inline-block mt-4 text-[#D52518] font-black uppercase text-xs border-b-2 border-[#D52518]">Go grab some burgers</Link>
                </div>
              )}
            </div>
          </div>

          {/* SUMMARY & BILL */}
          <div className="lg:col-span-5">
            <aside className="sticky top-28 space-y-6">
                             
              <div className="bg-white border-2 border-black rounded-[1.5rem] p-6 shadow-[6px_6px_0_0_#D52518]">
                <h4 className="font-black text-[10px] uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                  <MapPin size={14} className="text-black" /> Delivery Details
                </h4>
                <div className="border-2 border-black rounded-xl p-4 bg-[#F3E8CC]/30">
                   <div className="flex justify-between items-center text-xs font-bold uppercase mb-2">
                      <span className="text-gray-500">Alex Thompson</span>
                      <span>+62 812-3456-7890</span>
                   </div>
                   <p className="text-xs font-black uppercase leading-tight">South Residence, Block B No. 42, South Jakarta</p>
                </div>
              </div>

              {/* PAYMENT */}
              <div className="bg-white border-2 border-black rounded-[1.5rem] p-6 shadow-[6px_6px_0_0_#FFC926]">
                <h4 className="font-black text-[10px] uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                  <CreditCard size={14} className="text-black" /> Payment Method
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setPaymentMethod('bank')} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-black transition-all ${paymentMethod === 'bank' ? 'bg-[#FFC926] shadow-[4px_4px_0_0_#000] -translate-y-1' : 'bg-white'}`}>
                    <Landmark size={24}/><span className="font-black text-[10px] uppercase">Bank Transfer</span>
                  </button>
                  <button onClick={() => setPaymentMethod('cash')} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-black transition-all ${paymentMethod === 'cash' ? 'bg-[#FFC926] shadow-[4px_4px_0_0_#000] -translate-y-1' : 'bg-white'}`}>
                    <Banknote size={24}/><span className="font-black text-[10px] uppercase">Cash</span>
                  </button>
                </div>
              </div>

              {/* FINAL BILL */}
              <div className="bg-black text-white rounded-[2rem] p-8 border-2 border-black shadow-[8px_8px_0_0_#000]">
                <div className="space-y-3 mb-6 text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
                  <div className="flex justify-between"><span>Subtotal</span><span className="text-white">IDR {subtotal.toLocaleString('id-ID')}</span></div>
                  <div className="flex justify-between"><span>Delivery</span><span className="text-white">IDR {deliveryFee.toLocaleString('id-ID')}</span></div>
                  <div className="flex justify-between pb-3 border-b border-white/10"><span>Service Fee</span><span className="text-white">IDR {platformFee.toLocaleString('id-ID')}</span></div>
                </div>
                
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <p className="text-[9px] font-black uppercase text-[#FFC926] mb-1 tracking-widest">Grand Total</p>
                    <p className="text-4xl font-black italic tracking-tighter leading-none">IDR {total.toLocaleString('id-ID')}</p>
                  </div>
                  <Flame className={`text-[#D52518] ${cart.length > 0 ? 'animate-bounce' : ''}`} size={28} fill="currentColor" />
                </div>

                {/* TOMBOL ORDER DENGAN KONDISI DISABLED */}
                <button 
                  onClick={handlePlaceOrder}
                  disabled={cart.length === 0}
                  className={`w-full py-5 rounded-2xl border-2 font-black text-xl uppercase italic transition-all flex items-center justify-center gap-3
                    ${cart.length > 0 
                       ? 'bg-[#D52518] text-white border-white shadow-[0_5px_0_0_#fff] hover:translate-y-[5px] hover:shadow-none active:scale-95' 
                       : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed opacity-50'
                    }`}
                >
                  {cart.length > 0 ? "Place Order" : "Cart Empty"} <CheckCircle2 size={24} strokeWidth={3} />
                </button>
                                 
                <p className="mt-5 text-center text-[8px] font-bold text-gray-500 uppercase tracking-widest italic flex items-center justify-center gap-1">
                  <Info size={10} /> Quality guaranteed or it's on us
                </p>
              </div>

            </aside>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 35s linear infinite; }
      `}</style>
    </main>
  );
}

export default Checkout;
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import {
  ArrowLeft,
  MapPin,
  ShoppingBag,
  CheckCircle2,
  Flame,
  CreditCard,
  Banknote,
  FileText,
  ShoppingCart,
  User
} from 'lucide-react';

import { useCart } from '../context/CartContext';

// --- ASSET IMPORTS ---
import imgBeefPatty from '../assets/beef_patty.png'
import imgBottomBurger from '../assets/bottom_burger.png'
import imgCheese from '../assets/cheese.png'
import imgChickenPatty from '../assets/chicken_patty.png'
import imgLettuce from '../assets/lettuce.png'
import imgPickles from '../assets/pickles.png'
import imgTomato from '../assets/tomato.png'
import imgTopBurger from '../assets/top_burger.png'
import imgFrenchFries from '../assets/menus png/french_fries.png'
import imgNugget from '../assets/menus png/nugget.png'
import imgOnionRing from '../assets/menus png/onion_ring.png'
import imgSoda from '../assets/menus png/soda.png'
import imgTea from '../assets/menus png/tea.png'
import imgWater from '../assets/menus png/water.png'

const MascotBurger = "https://img.icons8.com/color/512/hamburger.png";

const ingredientImageMap = {
  bottom: imgBottomBurger, top: imgTopBurger, beef: imgBeefPatty,
  chicken: imgChickenPatty, cheese: imgCheese, lettuce: imgLettuce,
  pickle: imgPickles, tomato: imgTomato,
}

const menuImageMap = {
  nugget: imgNugget, french_fries: imgFrenchFries, onion_ring: imgOnionRing,
  soda: imgSoda, tea: imgTea, water: imgWater,
}

const getIngredientImage = (name) => {
  if (!name) return null;
  const n = name.toLowerCase();
  for (const key in ingredientImageMap) { if (n.includes(key)) return ingredientImageMap[key]; }
  return null;
}

const BurgerMiniPreview = ({ ingredients = [] }) => {
  let currentBottom = 6;
  return (
    <div className="relative w-24 h-24 bg-[#F3E8CC]/70 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-black/10 flex items-center justify-center">
      <div className="absolute bottom-1 w-full flex justify-center items-end">
        {ingredients.map((name, index) => {
          const img = getIngredientImage(name);
          const thickness = name.toLowerCase().includes('top') ? 8 : 5; 
          const pos = currentBottom;
          currentBottom += thickness;
          return (
            <div key={index} className="absolute left-1/2 -translate-x-1/2 w-[70%]" style={{ bottom: `${pos}px`, zIndex: index }}>
              {img && <img src={img} alt={name} className="w-full h-auto drop-shadow-sm" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const MenuMiniPreview = ({ name }) => {
  const getMenuImage = (itemName) => {
    if (!itemName) return null;
    const n = itemName.toLowerCase().replace(" ", "_");
    for (const key in menuImageMap) { if (n.includes(key)) return menuImageMap[key]; }
    return null;
  }
  const img = getMenuImage(name);
  return (
    <div className="relative w-24 h-24 bg-[#F3E8CC]/70 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-black/10 flex items-center justify-center p-3">
      {img ? <img src={img} alt={name} className="max-w-full max-h-full object-contain drop-shadow-md" /> : <img src={MascotBurger} alt="default" className="w-10 opacity-30" />}
    </div>
  );
}

function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart, cartCount } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  
  const [selectedAddress, setSelectedAddress] = useState({
  id: null, // Tambahkan ini
  name: "Loading...",
  phone: "",
  detail: "Fetching your profile address..."
});

  useEffect(() => {
    const globalNav = document.querySelector('nav') || document.querySelector('.navbar-global');
    if (globalNav) globalNav.style.display = 'none';

    // Ganti fungsi fetchProfileData di dalam useEffect Checkout.jsx
const fetchProfileData = async () => {
  try {
    // Gunakan endpoint /addresses agar mendapatkan data lengkap beserta ID
    const response = await api.get('/addresses');
    const addresses = response.data;
    
    if (addresses && addresses.length > 0) {
      // Cari alamat default, jika tidak ada ambil yang pertama
      const defaultAddr = addresses.find(a => a.is_default) || addresses[0];

      setSelectedAddress({
        id: defaultAddr.id, // SIMPAN ID DI SINI
        name: defaultAddr.recipient_name || "User",
        phone: defaultAddr.phone_number || "08xxxx",
        detail: defaultAddr.address || "Alamat belum diatur"
      });
    }
  } catch (error) {
    console.error("Sinkronisasi gagal:", error);
  }
};

    fetchProfileData();
    return () => { if (globalNav) globalNav.style.display = 'block'; };
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + ((item.unit_price ?? 0) * (item.qty ?? 1)), 0);
  const deliveryFee = subtotal > 100000 || subtotal === 0 ? 0 : 15000;
  // Service Fee Dihapus
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
  if (cart.length === 0) return;

  // Cek apakah ID sudah ada
  if (!selectedAddress.id) {
    alert("Silakan pilih atau atur alamat pengiriman di profil terlebih dahulu.");
    return;
  }

  setLoading(true);
  try {
    const payload = {
      amount: total,
      status: 'pending',
      payment_method: paymentMethod,
      address: selectedAddress.detail,
      address_id: selectedAddress.id, // ID sekarang sudah terisi
      items: cart.map(item => ({ 
        id: item.id, 
        qty: item.qty, 
        price: item.unit_price, 
        name: item.name 
      }))
    };
      await api.post('/transactions', payload);
      clearCart();
      navigate('/payment-status?status=success'); 
    } catch (error) {
      alert("Gagal memproses pesanan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#F3E8CC] font-sans text-black pb-20">
      <header className="sticky top-0 z-[60] bg-[#D52518] text-white shadow-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex w-1/3 justify-start">
            <Link to="/cart" className="rounded-2xl p-2 transition hover:bg-white/20"><ArrowLeft className="h-6 w-6" strokeWidth={3} /></Link>
          </div>
          <div className="flex w-1/3 justify-center text-xl font-extrabold tracking-wide">Aldes Burger</div>
          <div className="flex w-1/3 items-center justify-end gap-2 sm:gap-4">
            <Link to="/transactions" className="rounded-2xl p-2 transition hover:bg-white/20"><FileText className="h-6 w-6" /></Link>
            <div className="relative p-2"><ShoppingCart className="h-6 w-6" /><span className="absolute -right-1 -top-1 rounded-2xl bg-[#D52518] px-1.5 text-xs font-bold text-white ring-2 ring-[#F3E8CC]">{cartCount}</span></div>
            <Link to="/profile" className="rounded-2xl p-2 transition hover:bg-white/20"><User className="h-6 w-6" /></Link>
          </div>
        </div>
      </header>

      <div className="relative h-2 w-full flex overflow-hidden">
        <div className="absolute inset-0 flex">{[...Array(87)].map((_, i) => (<div key={i} className={`flex-1 h-full ${i % 2 === 0 ? 'bg-[#D52518]' : 'bg-white'}`}></div>))}</div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-8">
        {/* SECTION ALAMAT */}
        <section className="bg-white border-[3px] border-black rounded-2xl overflow-hidden shadow-[6px_6px_0_0_#000]">
          <div className="h-2 w-full bg-[repeating-linear-gradient(45deg,#D52518,#D52518_10px,#fff_10px,#fff_20px,#FFC926_20px,#FFC926_30px,#fff_30px,#fff_40px)]"></div>
          <div className="p-6">
            <div className="flex items-center gap-2 text-[#D52518] mb-3"><MapPin size={16} fill="currentColor" /><h2 className="font-black uppercase text-[11px] tracking-widest">Delivery Address</h2></div>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2"><span className="font-black text-lg uppercase">{selectedAddress.name}</span><span className="px-2 py-0.5 border-2 border-black text-black text-[9px] font-black uppercase rounded bg-[#FFC926]">Default</span></div>
                <p className="text-[11px] font-bold text-gray-500 uppercase leading-relaxed max-w-2xl">{selectedAddress.phone} | {selectedAddress.detail}</p>
              </div>
              <Link to="/profile" className="text-[#D52518] font-black text-[10px] uppercase underline underline-offset-4 decoration-2">Select Address</Link>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* PAYMENT METHOD */}
            <div className="space-y-4">
              <h2 className="text-xl font-black uppercase flex items-center gap-3"><CreditCard size={22} strokeWidth={3} /> Payment Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div onClick={() => setPaymentMethod('bank_transfer')} className={`cursor-pointer p-5 border-[3px] border-black rounded-2xl flex items-center justify-between shadow-[4px_4px_0_0_#000] ${paymentMethod === 'bank_transfer' ? 'bg-[#FFC926]' : 'bg-white'}`}>
                  <div className="flex items-center gap-4"><div className="p-2 bg-white border-2 border-black rounded-xl"><CreditCard size={20} /></div><div><p className="font-black uppercase text-xs">Transfer Bank</p></div></div>
                  <div className={`w-5 h-5 border-2 border-black rounded-full flex items-center justify-center ${paymentMethod === 'bank_transfer' ? 'bg-black' : 'bg-white'}`}>{paymentMethod === 'bank_transfer' && <div className="w-2 h-2 bg-[#FFC926] rounded-full" />}</div>
                </div>
                <div onClick={() => setPaymentMethod('cash')} className={`cursor-pointer p-5 border-[3px] border-black rounded-2xl flex items-center justify-between shadow-[4px_4px_0_0_#000] ${paymentMethod === 'cash' ? 'bg-[#FFC926]' : 'bg-white'}`}>
                  <div className="flex items-center gap-4"><div className="p-2 bg-white border-2 border-black rounded-xl"><Banknote size={20} /></div><div><p className="font-black uppercase text-xs">Cash</p></div></div>
                  <div className={`w-5 h-5 border-2 border-black rounded-full flex items-center justify-center ${paymentMethod === 'cash' ? 'bg-black' : 'bg-white'}`}>{paymentMethod === 'cash' && <div className="w-2 h-2 bg-[#FFC926] rounded-full" />}</div>
                </div>
              </div>
            </div>

            {/* ORDER SUMMARY */}
            <div className="space-y-4">
              <h2 className="text-xl font-black uppercase flex items-center gap-3"><ShoppingBag size={22} strokeWidth={3} /> Order Summary</h2>
              <div className="space-y-4">
                {cart.map((item) => {
                  const isBurger = Array.isArray(item.ingredients) && item.ingredients.length > 0;
                  return (
                    <div key={item.id} className="bg-white border-[3px] border-black rounded-2xl p-4 flex items-center gap-5 shadow-[5px_5px_0_0_#000]">
                      {isBurger ? <BurgerMiniPreview ingredients={item.ingredients} /> : <MenuMiniPreview name={item.name} />}
                      <div className="flex-1 flex justify-between items-center">
                        <div><h3 className="font-black text-lg uppercase">{item.name}</h3><span className="px-3 py-1 bg-black text-[#FFC926] text-[10px] font-black rounded-full uppercase mt-2">{item.qty}x</span></div>
                        <div className="text-right"><p className="text-[10px] font-black text-gray-400">Subtotal</p><p className="font-black text-2xl italic">IDR {((item.unit_price ?? 0) * (item.qty ?? 1)).toLocaleString('id-ID')}</p></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="w-full">
            {/* KOTAK TOTAL HARGA: BG PUTIH, BORDER HITAM, TEKS MERAH */}
            <div className="bg-white text-[#D52518] rounded-[2rem] p-7 border-4 border-black shadow-[8px_8px_0_0_#000] sticky top-28">
              <div className="space-y-3 mb-6 text-[10px] font-black uppercase text-[#D52518]/60">
                <div className="flex justify-between items-center"><span>Subtotal</span><span className="text-[#D52518] text-xs">IDR {subtotal.toLocaleString('id-ID')}</span></div>
                {/* Service Fee Dihapus, Border dipindah ke Delivery */}
                <div className="flex justify-between items-center pb-3 border-b-2 border-black/10"><span>Delivery</span><span className="text-[#D52518] text-xs">IDR {deliveryFee.toLocaleString('id-ID')}</span></div>
              </div>
              
              <div className="flex justify-between items-end mb-8">
                <div><p className="text-[10px] font-black uppercase text-[#D52518]">Grand Total</p><p className="text-3xl font-black italic">IDR {total.toLocaleString('id-ID')}</p></div>
                <Flame className="text-[#D52518] animate-pulse" size={32} fill="currentColor" />
              </div>
              
              {/* Tombol Place Order Tetap Merah */}
              <button onClick={handlePlaceOrder} disabled={cart.length === 0 || loading} className="w-full py-4 rounded-xl bg-[#D52518] text-white border-2 border-black font-black text-lg uppercase shadow-[0_4px_0_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                {loading ? "Ordering..." : "Place Order"} <CheckCircle2 size={20} strokeWidth={4} />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Checkout;
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../lib/api'; // <--- Tambahkan import ini
// ... import lainnya
import {
  ArrowLeft,
  MapPin,
  ShoppingBag,
  CheckCircle2,
  Flame,
  X,
  Plus,
  CreditCard,
  Banknote
} from 'lucide-react';
import MascotBurger from '../assets/mascot-burger.png';
import { useCart } from '../context/CartContext';

// const api = axios.create({
//   baseURL: 'http://localhost:8000/api',
//   withCredentials: true 
// });

function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State untuk pilihan pembayaran
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer'); // default

  const [addressList, setAddressList] = useState([
    {
      id: 1,
      name: "LUCIA SHERINA",
      phone: "(+62) 892 3651 2448",
      detail: "Jalan Pakuan No 3, Sumur Batu (RUMAH TALENTA BCA), KAB. BOGOR - BABAKAN MADANG, JAWA BARAT, ID 16810",
      isDefault: true
    },
    {
      id: 2,
      name: "JEONGWOO",
      phone: "(+62) 895 0000 2112",
      detail: "RT.2/RW.1, SEOUL",
      isDefault: false
    }
  ]);

  const [selectedAddress, setSelectedAddress] = useState(addressList[0]);

  const subtotal = cart.reduce((sum, item) => sum + ((item.unit_price ?? 0) * (item.qty ?? 1)), 0);
  const deliveryFee = subtotal > 100000 || subtotal === 0 ? 0 : 15000;
  const platformFee = subtotal === 0 ? 0 : 2000;
  const total = subtotal + deliveryFee + platformFee;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const payload = {
        amount: total,
        status: 'pending',
        payment_method: paymentMethod, 
        address: selectedAddress.detail,
        address_id: selectedAddress.id,
        items: cart.map(item => ({
          id: item.menu_id, 
          qty: item.qty,
          price: item.unit_price,
          name: item.name,
          ingredients: item.ingredients || [] // <--- TAMBAHKAN BARIS INI
        }))
      };

      // Pastikan mengarah ke /transactions
      const response = await api.post('/transactions', payload);

      if (response.status === 201 || response.status === 200) {
        clearCart();
        navigate('/payment-status?status=success'); 
      }
    } catch (error) {
      console.error("Gagal Checkout:", error);
      alert("Gagal simpan pesanan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#F3E8CC] font-sans text-black pb-20">
      
      {/* HEADER */}
      <header className="sticky top-0 z-[60] w-full bg-white/60 backdrop-blur-lg border-b-2 border-black px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/cart" className="flex items-center gap-2 bg-white border-2 border-black px-5 py-2 rounded-xl font-bold shadow-[4px_4px_0_0_#000] text-[10px] uppercase transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
            <ArrowLeft size={16} strokeWidth={3} /> Back
          </Link>
          <h1 className="text-xl font-black uppercase tracking-tight">Aldes Burger</h1>
          <div className="w-10 h-10 rounded-xl border-2 border-black bg-[#FFC926] p-1 shadow-[3px_3px_0_0_#000]">
            <img src={MascotBurger} alt="Mascot" className="w-full h-full object-contain" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-10">
        
        {/* SECTION ALAMAT */}
        <section className="bg-white border-4 border-black rounded-[2rem] overflow-hidden shadow-[8px_8px_0_0_#000]">
          <div className="h-2 w-full bg-[repeating-linear-gradient(45deg,#D52518,#D52518_10px,#fff_10px,#fff_20px,#FFC926_20px,#FFC926_30px,#fff_30px,#fff_40px)]"></div>
          <div className="p-8">
            <div className="flex items-center gap-2 text-[#D52518] mb-4">
              <MapPin size={20} fill="currentColor" />
              <h2 className="font-black uppercase text-sm tracking-widest">Delivery Address</h2>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="font-black text-lg uppercase tracking-tight">{selectedAddress.name} {selectedAddress.phone}</span>
                  {selectedAddress.isDefault && (
                    <span className="px-2 py-0.5 border-2 border-[#D52518] text-[#D52518] text-[9px] font-black uppercase rounded-lg bg-red-50">Default</span>
                  )}
                </div>
                <p className="text-xs font-bold text-gray-500 leading-relaxed uppercase max-w-2xl">{selectedAddress.detail}</p>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="text-[#FFC926] hover:text-black font-black text-sm uppercase underline underline-offset-8 decoration-4 transition-all">
                Change
              </button>
            </div>
          </div>
        </section>

        {/* SECTION PAYMENT METHOD */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
            <CreditCard size={24} strokeWidth={3} /> Payment Method
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* BANK TRANSFER */}
            <div 
              onClick={() => setPaymentMethod('bank_transfer')}
              className={`cursor-pointer p-6 border-4 border-black rounded-2xl flex items-center justify-between transition-all
                ${paymentMethod === 'bank_transfer' ? 'bg-[#FFC926] shadow-[6px_6px_0_0_#000] translate-y-[-4px]' : 'bg-white shadow-[4px_4px_0_0_#000] hover:translate-y-[-2px]'}`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white border-2 border-black rounded-xl">
                  <CreditCard size={24} strokeWidth={3} />
                </div>
                <div>
                  <p className="font-black uppercase text-sm">Transfer Bank</p>
                  <p className="text-[10px] font-bold text-gray-500">BCA, Mandiri, atau BNI</p>
                </div>
              </div>
              <div className={`w-6 h-6 border-4 border-black rounded-full flex items-center justify-center ${paymentMethod === 'bank_transfer' ? 'bg-black' : 'bg-white'}`}>
                {paymentMethod === 'bank_transfer' && <div className="w-2 h-2 bg-[#FFC926] rounded-full" />}
              </div>
            </div>

            {/* CASH */}
            <div 
              onClick={() => setPaymentMethod('cash')}
              className={`cursor-pointer p-6 border-4 border-black rounded-2xl flex items-center justify-between transition-all
                ${paymentMethod === 'cash' ? 'bg-[#FFC926] shadow-[6px_6px_0_0_#000] translate-y-[-4px]' : 'bg-white shadow-[4px_4px_0_0_#000] hover:translate-y-[-2px]'}`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white border-2 border-black rounded-xl">
                  <Banknote size={24} strokeWidth={3} />
                </div>
                <div>
                  <p className="font-black uppercase text-sm">Cash</p>
                  <p className="text-[10px] font-bold text-gray-500">Bayar saat pesanan sampai</p>
                </div>
              </div>
              <div className={`w-6 h-6 border-4 border-black rounded-full flex items-center justify-center ${paymentMethod === 'cash' ? 'bg-black' : 'bg-white'}`}>
                {paymentMethod === 'cash' && <div className="w-2 h-2 bg-[#FFC926] rounded-full" />}
              </div>
            </div>
          </div>
        </section>

        {/* CONTAINER UTAMA - Sticky Payment Box */}
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* KOLOM KIRI: ORDER SUMMARY */}
          <div className="w-full lg:flex-1 space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              <ShoppingBag size={28} strokeWidth={3} /> Order Summary
            </h2>
            
            <div className="space-y-6">
              {cart.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`bg-white border-4 border-black rounded-[2rem] p-6 flex items-center gap-6 transition-all duration-300
                    ${index % 2 === 0 ? 'shadow-[8px_8px_0_0_#FFC926]' : 'shadow-[8px_8px_0_0_#D52518]'}`}
                >
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-black rounded-2xl translate-x-1 translate-y-1"></div>
                    <div className="relative w-24 h-24 bg-[#F3E8CC] border-2 border-black rounded-2xl p-2 overflow-hidden">
                      <img src={item.image || MascotBurger} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-2">
                        <h3 className="font-black text-xl uppercase leading-tight">{item.name}</h3>
                        <span className="inline-block px-3 py-1 bg-black text-[#FFC926] text-[10px] font-black rounded-full uppercase tracking-tighter">
                          {item.qty}x Item
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Subtotal</p>
                        <p className="font-black text-2xl">IDR {((item.unit_price ?? 0) * (item.qty ?? 1)).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KOLOM KANAN: PAYMENT BOX (STICKY) */}
          <aside className="w-full lg:w-[450px] lg:sticky lg:top-28">
            <div className="bg-black text-white rounded-[2.5rem] p-10 border-4 border-black shadow-[12px_12px_0_0_#FFC926]">
              <div className="space-y-4 mb-8 text-xs font-bold uppercase tracking-widest text-gray-400">
                <div className="flex justify-between"><span>Subtotal</span><span className="text-white">IDR {subtotal.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span className="text-white">IDR {deliveryFee.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between pb-4 border-b-2 border-white/10"><span>Service Fee</span><span className="text-white">IDR {platformFee.toLocaleString('id-ID')}</span></div>
              </div>
              
              <div className="flex justify-between items-center mb-10">
                <div>
                  <p className="text-[10px] font-black uppercase text-[#FFC926] mb-1">Grand Total</p>
                  <p className="text-5xl font-black tracking-tighter">IDR {total.toLocaleString('id-ID')}</p>
                </div>
                <Flame className="text-[#D52518] animate-bounce" size={40} fill="currentColor" />
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={cart.length === 0 || loading}
                className="w-full py-6 rounded-2xl bg-[#D52518] text-white border-4 border-white font-black text-2xl uppercase shadow-[0_8px_0_0_#fff] hover:translate-y-[6px] hover:shadow-none transition-all flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {loading ? "Ordering..." : "Place Order"} <CheckCircle2 size={28} strokeWidth={3} />
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* MODAL ALAMAT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white border-4 border-black w-full max-w-2xl rounded-[3rem] shadow-[15px_15px_0_0_#000] overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-8 border-b-4 border-black flex justify-between items-center bg-[#F3E8CC]/50">
              <h3 className="text-3xl font-black uppercase">Select Address</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white border-2 border-black hover:bg-[#FFC926] rounded-full transition-all">
                <X size={24} strokeWidth={4} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-5 bg-gray-50">
              {addressList.map((addr) => (
                <label 
                  key={addr.id} 
                  className={`relative flex gap-6 p-6 rounded-[2rem] border-4 transition-all cursor-pointer
                    ${selectedAddress.id === addr.id ? 'border-black bg-[#FFC926]/30 shadow-[6px_6px_0_0_#000]' : 'border-gray-200 hover:border-black'}`}
                >
                  <div className="pt-1">
                    <input type="radio" name="address" className="w-6 h-6 accent-black" checked={selectedAddress.id === addr.id} onChange={() => setSelectedAddress(addr)} />
                  </div>
                  <div className="flex-1">
                    <span className="font-black text-base uppercase block">{addr.name} | {addr.phone}</span>
                    <p className="text-xs font-bold text-gray-600 leading-relaxed uppercase mt-1">{addr.detail}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="p-8 border-t-4 border-black bg-white">
              <button onClick={() => setIsModalOpen(false)} className="w-full py-4 bg-black text-[#FFC926] rounded-2xl font-black uppercase border-4 border-black shadow-[4px_4px_0_0_#D52518] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Checkout;
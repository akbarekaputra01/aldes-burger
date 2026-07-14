import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  User,
  Plus,
  ChevronDown,
  ChevronUp,
  Home,
  Briefcase,
  Loader2,
  ChefHat
} from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useTranslation } from '../context/LanguageContext';
import AddressBookModal from '../components/AddressBookModal';

// --- Burger ingredient image assets ---
import imgBeefPatty from '../assets/beef_patty.png'
import imgBottomBurger from '../assets/bottom_burger.png'
import imgCheese from '../assets/cheese.png'
import imgChickenPatty from '../assets/chicken_patty.png'
import imgLettuce from '../assets/lettuce.png'
import imgPickles from '../assets/pickles.png'
import imgTomato from '../assets/tomato.png'
import imgTopBurger from '../assets/top_burger.png'
import imgKetchup from '../assets/ketchup.png'
import imgMayonnaise from '../assets/mayonnaise.png'
import imgSecretSauce from '../assets/secret_sauce.png'

// --- Menu image assets ---
import imgFrenchFries from '../assets/menus png/french_fries.png'
import imgNugget from '../assets/menus png/nugget.png'
import imgOnionRing from '../assets/menus png/onion_ring.png'
import imgSoda from '../assets/menus png/soda.png'
import imgTea from '../assets/menus png/tea.png'
import imgWater from '../assets/menus png/water.png'

const ingredientImageMap = {
  bottom: imgBottomBurger,
  top: imgTopBurger,
  beef: imgBeefPatty,
  chicken: imgChickenPatty,
  cheese: imgCheese,
  lettuce: imgLettuce,
  pickle: imgPickles,
  tomato: imgTomato,
  ketchup: imgKetchup,
  mayonnaise: imgMayonnaise,
  secret_sauce: imgSecretSauce,
  'secret sauce': imgSecretSauce
}

const menuImageMap = {
  nugget: imgNugget,
  french_fries: imgFrenchFries,
  onion_ring: imgOnionRing,
  soft_drink: imgSoda,
  tea: imgTea,
  water: imgWater
}

const getIngredientImage = (name) => {
  if (!name) return null;
  const n = name.toLowerCase();
  for (const key in ingredientImageMap) {
    if (n.includes(key)) return ingredientImageMap[key];
  }
  return null;
}

const getIngredientThickness = (name) => {
  if (!name) return 8
  const n = name.toLowerCase()
  if (n.includes('lettuce')) return 0 
  if (n.includes('pickle') || n.includes('tomato') || n.includes('cheese')) return 1
  if (n.includes('bottom') || n.includes('ketchup') || n.includes('mayonnaise') || n.includes('secret sauce')) return 2
  if (n.includes('beef') || n.includes('chicken')) return 10
  if (n.includes('top')) return 12
  return 2
}

const getVisualOffset = (name) => {
  const n = name.toLowerCase()
  if (n.includes('beef') || n.includes('chicken')) return 10
  return 0
}

const BurgerMiniPreview = ({ ingredients = [] }) => {
  let currentBottom = 4;
  const scaleValue = ingredients.length > 8 ? 0.65 : ingredients.length > 6 ? 0.8 : 1;

  return (
    <div className="relative w-24 h-28 bg-aldesCream/50 border-4 border-black rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center shadow-[4px_4px_0_0_#000]">
      <div
        className="absolute bottom-2 w-full flex center items-end"
        style={{ transform: `scale(${scaleValue})`, transformOrigin: 'bottom' }}
      >
        {ingredients.map((name, index) => {
          const img = getIngredientImage(name);
          const thickness = getIngredientThickness(name);
          const pos = currentBottom;
          currentBottom += thickness;
          return (
            <div
              key={index}
              className="absolute left-1/2 -translate-x-1/2 w-20"
              style={{ bottom: `${pos + getVisualOffset(name)}px`, zIndex: index }}
            >
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
    const n = itemName.toLowerCase().replace(' ', '_');
    for (const key in menuImageMap) {
      if (n.includes(key)) return menuImageMap[key];
    }
    return null;
  }

  const img = getMenuImage(name);
  return (
    <div className="relative w-20 h-20 md:w-24 md:h-24 bg-aldesCream/50 border-4 border-black rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2 shadow-[4px_4px_0_0_#000]">
      {img ? (
        <img src={img} alt={name} className="max-w-15 max-h-15 object-contain" />
      ) : (
        <div className="text-[10px] font-black text-black text-center uppercase">No Img</div>
      )}
    </div>
  );
}

const AddressLabelIcon = ({ label }) => {
  if (label === 'Work') return <Briefcase size={12} className="inline mr-1" />;
  return <Home size={12} className="inline mr-1" />;
}

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const checkoutItems = location.state?.checkoutItems || [];
  const { removeFromCart, cartCount } = useCart();
  const { t } = useTranslation();

  const getLocalizedLabel = (label) => {
    if (!label) return '';
    const key = `addressForm.${label.toLowerCase()}`;
    const translated = t(key);
    return translated === key ? label : translated;
  }

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [userPhone, setUserPhone] = useState('');

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || null;

  useEffect(() => {
    const fetchAddresses = async () => {
      setLoadingAddresses(true);
      try {
        const res = await api.get('/addresses');
        setAddresses(res.data);
        const def = res.data.find(a => a.is_default) || res.data[0];
        if (def) {
          setSelectedAddressId(def.id);
          setUserPhone(def.phone_number || '');
        }
      } catch {
        setAddresses([]);
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, []);

  useEffect(() => {
    const globalNav = document.querySelector('nav') || document.querySelector('.navbar-global');
    if (globalNav) globalNav.style.display = 'none';
    return () => { if (globalNav) globalNav.style.display = 'block'; };
  }, []);

  const subtotal = checkoutItems.reduce((sum, item) => sum + ((item.unit_price ?? 0) * (item.qty ?? 1)), 0);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (checkoutItems.length === 0 || !selectedAddressId) return;
    
    setLoading(true); // Memunculkan loading overlay

    try {
      const payload = {
        payment_method: paymentMethod,
        address_id: selectedAddressId,
        items: checkoutItems.map(item => ({
          menu_id: item.menu_id,
          quantity: item.qty ?? 1,
          modifiers: item.modifiers ?? [],
          ingredients: item.ingredients ?? [],
        })),
      };

      const response = await api.post('/checkout', payload);
      const snapToken = response.data.snap_token;
      
      // Mengambil ID transaksi (sesuaikan jika struktur JSON backend Anda berbeda)
      const transactionId = response.data.transaction?.id || response.data.id || response.data.order_id;

      if (paymentMethod === 'cash') {
        checkoutItems.forEach(item => removeFromCart(item.id));
        setLoading(false);
        navigate('/payment-status?status=success');
      } else if (snapToken) {
        // Matikan loading animasi karena popup Midtrans sudah siap dipanggil
        setLoading(false);

        window.snap.pay(snapToken, {
          onSuccess: function(result){
            checkoutItems.forEach(item => removeFromCart(item.id));
            navigate('/payment-status?status=success');
          },
          onPending: function(result){
            checkoutItems.forEach(item => removeFromCart(item.id));
            navigate('/transactions'); 
          },
          onError: function(result){
            checkoutItems.forEach(item => removeFromCart(item.id));
            navigate('/payment-status?status=failed');
          },
          onClose: function(){
            // Kosongkan keranjang agar tidak double order
            checkoutItems.forEach(item => removeFromCart(item.id));
            
            // Arahkan ke detail transaksi untuk dilanjutkan nanti
            if (transactionId) {
              navigate(`/transactions/${transactionId}`);
            } else {
              navigate('/transactions');
            }
          }
        });
      }
    } catch (error) {
      console.error('Checkout error:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-aldesCream text-black pb-20 relative">
      
      {/* ── Overlay Animasi Loading (Neo-Brutalist & English) ── */}
      {loading && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex flex-col items-center justify-center backdrop-blur-sm transition-all duration-300">
          <div className="bg-white border-4 border-black rounded-[2rem] p-8 flex flex-col items-center shadow-[12px_12px_0_0_#FFC926] max-w-sm w-[90%] text-center relative overflow-hidden animate-in zoom-in duration-300">
            
            <div className="relative mb-6 mt-4">
              {/* Glowing effect */}
              <div className="absolute inset-0 bg-aldesRed/20 rounded-full blur-xl animate-pulse scale-150"></div>
              
              {/* Main Icon Circle */}
              <div className="relative bg-aldesRed border-4 border-black w-24 h-24 rounded-full flex items-center justify-center shadow-[6px_6px_0_0_#000]">
                 {paymentMethod === 'cash' ? (
                   <ChefHat className="text-white w-12 h-12" />
                 ) : (
                   <CreditCard className="text-white w-12 h-12" />
                 )}
              </div>
              
              {/* Spinning Loader */}
              <div className="absolute -bottom-3 -right-3 bg-white border-4 border-black rounded-full w-12 h-12 flex items-center justify-center shadow-[4px_4px_0_0_#000]">
                <Loader2 className="animate-spin text-aldesRed w-7 h-7" />
              </div>
            </div>
            
            <h3 className="text-black font-black text-2xl tracking-tighter uppercase mb-2">
              {paymentMethod === 'cash' ? t('checkout.processingOrder') : t('checkout.preparingPayment')}
            </h3>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest animate-pulse">
              {t('checkout.pleaseWait')}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-8">

        {/* ── Delivery Address ── */}
        <section className="bg-white border-[3px] border-black rounded-2xl overflow-hidden shadow-[6px_6px_0_0_#000]">
          <div className="h-2 w-full bg-[repeating-linear-gradient(45deg,#D52518,#D52518_10px,#fff_10px,#fff_20px,#FFC926_20px,#FFC926_30px,#fff_30px,#fff_40px)]"></div>
          <div className="p-6">
            <div className="flex items-center gap-2 text-aldesRed mb-4">
              <MapPin size={16} fill="currentColor" />
              <h2 className="font-black uppercase text-[11px] tracking-widest">{t('checkout.deliveryAddress')}</h2>
            </div>

            {loadingAddresses ? (
              <p className="text-sm text-gray-400 italic">{t('checkout.loadingAddresses')}</p>
            ) : addresses.length === 0 ? (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-gray-500">{t('checkout.noAddress')}</p>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="text-aldesRed font-black text-[10px] uppercase underline underline-offset-4 decoration-2 flex items-center gap-1"
                >
                  <Plus size={12} /> {t('checkout.addAddress')}
                </button>
              </div>
            ) : (
              <>
                {selectedAddress && (
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-black text-lg uppercase">{selectedAddress.recipient_name}</span>
                        {selectedAddress.label && (
                          <span className="px-2 py-0.5 border-2 border-black text-black text-[9px] font-black uppercase rounded bg-aldesYellow">
                            <AddressLabelIcon label={selectedAddress.label} />{getLocalizedLabel(selectedAddress.label)}
                          </span>
                        )}
                        {selectedAddress.is_default && (
                          <span className="px-2 py-0.5 border-2 border-black text-black text-[9px] font-black uppercase rounded bg-green-200">{t('checkout.default')}</span>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-gray-500 uppercase leading-relaxed max-w-2xl">
                        {selectedAddress.phone_number} | {selectedAddress.address}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddressPicker(v => !v)}
                      className="text-aldesRed font-black text-[10px] uppercase underline underline-offset-4 decoration-2 flex items-center gap-1 flex-shrink-0"
                    >
                      {t('checkout.change')} {showAddressPicker ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>
                )}

                {showAddressPicker && (
                  <div className="border-t-2 border-dashed border-black/10 pt-4 mt-2 space-y-2">
                    {addresses.map(addr => (
                      <div
                        key={addr.id}
                        onClick={() => { setSelectedAddressId(addr.id); setShowAddressPicker(false); }}
                        className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${selectedAddressId === addr.id ? 'border-aldesRed bg-red-50' : 'border-gray-200 bg-white hover:border-aldesRed/50'}`}
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-black text-sm uppercase">{addr.recipient_name}</span>
                          {addr.label && (
                            <span className="px-1.5 py-0.5 bg-aldesYellow border border-black text-[8px] font-black uppercase rounded">
                              <AddressLabelIcon label={addr.label} />{getLocalizedLabel(addr.label)}
                            </span>
                          )}
                          {addr.is_default && (
                            <span className="px-1.5 py-0.5 bg-green-100 border border-green-300 text-[8px] font-black uppercase rounded text-green-700">{t('checkout.default')}</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold leading-relaxed">{addr.phone_number} | {addr.address}</p>
                      </div>
                    ))}
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 font-bold text-xs hover:border-aldesRed hover:text-aldesRed transition-all"
                    >
                      <Plus size={14} /> {t('checkout.addNewAddress')}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">

            {/* ── Payment Method ── */}
            <div className="space-y-4">
              <h2 className="text-xl font-black uppercase flex items-center gap-3">
                <CreditCard size={22} strokeWidth={3} /> {t('checkout.paymentMethod')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div onClick={() => setPaymentMethod('bank_transfer')} className={`cursor-pointer p-5 border-[3px] border-black rounded-2xl flex items-center justify-between shadow-[4px_4px_0_0_#000] ${paymentMethod === 'bank_transfer' ? 'bg-aldesYellow' : 'bg-white'}`}>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white border-2 border-black rounded-xl"><CreditCard size={20} /></div>
                    <div><p className="font-black uppercase text-xs">{t('checkout.bankTransfer')}</p></div>
                  </div>
                  <div className={`w-5 h-5 border-2 border-black rounded-full flex items-center justify-center ${paymentMethod === 'bank_transfer' ? 'bg-black' : 'bg-white'}`}>
                    {paymentMethod === 'bank_transfer' && <div className="w-2 h-2 bg-aldesYellow rounded-full" />}
                  </div>
                </div>
                <div onClick={() => setPaymentMethod('cash')} className={`cursor-pointer p-5 border-[3px] border-black rounded-2xl flex items-center justify-between shadow-[4px_4px_0_0_#000] ${paymentMethod === 'cash' ? 'bg-aldesYellow' : 'bg-white'}`}>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white border-2 border-black rounded-xl"><Banknote size={20} /></div>
                    <div><p className="font-black uppercase text-xs">{t('checkout.cash')}</p></div>
                  </div>
                  <div className={`w-5 h-5 border-2 border-black rounded-full flex items-center justify-center ${paymentMethod === 'cash' ? 'bg-black' : 'bg-white'}`}>
                    {paymentMethod === 'cash' && <div className="w-2 h-2 bg-aldesYellow rounded-full" />}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Order Summary ── */}
            <div className="space-y-4">
              <h2 className="text-xl font-black uppercase flex items-center gap-3">
                <ShoppingBag size={22} strokeWidth={3} /> {t('checkout.orderSummary')}
              </h2>
              <div className="space-y-4">
                {checkoutItems.map((item) => {
                  const isBurger = Array.isArray(item.ingredients) && item.ingredients.length > 0;
                  const hasModifiers = Array.isArray(item.modifiers) && item.modifiers.length > 0;
                  return (
                    <div key={item.id} className="bg-white border-[3px] border-black rounded-2xl p-4 flex gap-4 shadow-[5px_5px_0_0_#000]">
                      {isBurger ? (
                        <BurgerMiniPreview ingredients={item.ingredients} />
                      ) : (
                        <MenuMiniPreview name={item.name} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-black text-base uppercase">{item.name}</h3>
                          <span className="px-3 py-1 bg-black text-aldesYellow text-[10px] font-black rounded-full uppercase flex-shrink-0">
                            {item.qty}x
                          </span>
                        </div>

                        {isBurger && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.ingredients.map((name, i) => (
                              <span key={i} className="text-[10px] font-bold bg-aldesCream text-black px-2 py-0.5 rounded-full border border-black/10">
                                {name}
                              </span>
                            ))}
                          </div>
                        )}

                        {!isBurger && hasModifiers && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.modifiers.map((m, i) => {
                              const name = m.ingredient_name || m.ingredient_id;
                              const isAdd = m.action === 'add';
                              return (
                                <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isAdd ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                  {isAdd ? '+' : '–'} {name}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        <div className="mt-3 text-right">
                          <p className="text-[10px] font-black text-gray-400">{t('checkout.subtotal')}</p>
                          <p className="font-black text-xl italic">
                            IDR {((item.unit_price ?? 0) * (item.qty ?? 1)).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Payment Summary sidebar ── */}
          <aside className="w-full">
            <div className="bg-white text-aldesRed rounded-[2rem] p-7 border-4 border-black shadow-[8px_8px_0_0_#000] sticky top-28">
              <div className="space-y-3 mb-6 text-[10px] font-black uppercase text-aldesRed/60">
                <div className="flex justify-between items-center">
                  <span>{t('checkout.subtotal')}</span>
                  <span className="text-aldesRed text-xs">IDR {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b-2 border-black/10">
                  <span>{t('checkout.delivery')}</span>
                  <span className="text-aldesRed text-xs">{t('checkout.free')}</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase text-aldesRed">{t('checkout.grandTotal')}</p>
                  <p className="text-3xl font-black italic">IDR {total.toLocaleString('id-ID')}</p>
                </div>
                <Flame className="text-aldesRed animate-pulse" size={32} fill="currentColor" />
              </div>

              {!selectedAddressId && !loadingAddresses && (
                <p className="text-[10px] text-red-500 font-bold mb-3 text-center uppercase">
                  {t('checkout.selectAddressWarning')}
                </p>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={checkoutItems.length === 0 || loading || !selectedAddressId}
                className="w-full py-4 rounded-xl bg-aldesRed text-white border-2 border-black font-black text-lg uppercase shadow-[0_4px_0_0_#000] active:translate-y-1 active:shadow-[0_3px_0_0_#000] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('checkout.ordering') : t('checkout.placeOrder')} <CheckCircle2 size={20} strokeWidth={4} />
              </button>
            </div>
          </aside>
        </div>
      </div>

      <AddressBookModal
        open={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSaved={async () => {
          try {
            const res = await api.get('/addresses');
            setAddresses(res.data);
            const def = res.data.find(a => a.is_default) || res.data[0];
            if (def) setSelectedAddressId(def.id);
          } catch { /* ignore */ }
        }}
        userPhone={userPhone}
      />
    </main>
  );
}

export default Checkout;
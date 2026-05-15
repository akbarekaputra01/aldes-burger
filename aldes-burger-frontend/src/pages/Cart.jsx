import React, { useState } from 'react'
import { Minus, Plus, Trash2, ReceiptText, ShoppingBag, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

// --- IMPORT ASSETS ---
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

const ingredientImageMap = {
  bottom: imgBottomBurger,
  top: imgTopBurger,
  beef: imgBeefPatty,
  chicken: imgChickenPatty,
  cheese: imgCheese,
  lettuce: imgLettuce,
  pickle: imgPickles,
  tomato: imgTomato,
}

const menuImageMap = {
  nugget: imgNugget,
  french_fries: imgFrenchFries,
  onion_ring: imgOnionRing,
  soft_drink: imgSoda,
  tea: imgTea,
  water: imgWater,
}

const getIngredientImage = (name) => {
  if (!name) return null
  const n = name.toLowerCase()
  for (const key in ingredientImageMap) {
    if (n.includes(key)) return ingredientImageMap[key]
  }
  return null
}

const getIngredientThickness = (name) => {
  if (!name) return 8
  const n = name.toLowerCase()
  if (n.includes('lettuce')) return 0 
  if (n.includes('bottom') || n.includes('pickle') || n.includes('tomato')) return 2
  if (n.includes('cheese')) return 4
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
  let currentBottom = 4
  const scaleValue = ingredients.length > 8 ? 0.65 : ingredients.length > 6 ? 0.8 : 1;

  return (
    <div className="relative w-20 h-20 md:w-24 md:h-24 bg-white border-4 border-black rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center shadow-[4px_4px_0_0_#000]">
      <div 
        className="absolute bottom-2 w-full flex justify-center items-end transition-transform duration-300"
        style={{ transform: `scale(${scaleValue})`, transformOrigin: 'bottom' }}
      >
        {ingredients.map((name, index) => {
          const img = getIngredientImage(name)
          const thickness = getIngredientThickness(name)
          const pos = currentBottom
          currentBottom += thickness
          return (
            <div 
              key={index}
              className="absolute left-1/2 -translate-x-1/2 w-14 md:w-16"
              style={{ bottom: `${pos + getVisualOffset(name)}px`, zIndex: index }}
            >
              {img && <img src={img} alt={name} className="w-full h-auto" />}
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
    for (const key in menuImageMap) {
      if (n.includes(key)) return menuImageMap[key];
    }
    return null;
  }
  
  const img = getMenuImage(name);
  return (
    <div className="relative w-20 h-20 md:w-24 md:h-24 bg-white border-4 border-black rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2 shadow-[4px_4px_0_0_#000]">
      {img ? (
        <img src={img} alt={name} className="max-w-full max-h-full object-contain" />
      ) : (
        <div className="text-[10px] font-black text-black text-center uppercase">No Img</div>
      )}
    </div>
  );
}

function Cart() {
  const navigate = useNavigate()
  const contextValue = useCart()

  const cart = contextValue?.cart ?? []
  const removeFromCart = contextValue?.removeFromCart ?? (() => { })
  const updateQty = contextValue?.updateQty

  const [selectedIds, setSelectedIds] = useState([])

  const handleIncrease = (item) => {
    updateQty(item.id, (item.qty ?? 1) + 1);
  };

  const handleDecrease = (item) => {
    if ((item.qty ?? 1) > 1) {
      updateQty(item.id, (item.qty ?? 1) - 1);
    } else {
      removeFromCart(item.id);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount)

  const getItemPrice = (item) => Number((item.unit_price ?? item.price ?? 0).toString().replace(/[^\d]/g, '')) || 0;

  const getIngredientNameById = (item, id) => {
    const names = { '1':'Beef','2':'Chicken','3':'Cheese','4':'Pickles','5':'Lettuce','6':'Tomato','7':'Top Bun','8':'Bottom Bun' };
    return names[String(id)] || `Item #${id}`;
  };

  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleSelectAll = () => (selectedIds.length === cart.length && cart.length > 0) ? setSelectedIds([]) : setSelectedIds(cart.map(i => i.id));

  if (!Array.isArray(cart) || cart.length === 0) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-[#F3E8CC] p-4 font-sans">
        <section className="w-full max-w-[500px] bg-white border-[6px] border-black rounded-[2.5rem] p-8 text-center shadow-[12px_12px_0_0_#000]">
          <ShoppingBag className="mx-auto h-16 w-16 text-black mb-4 stroke-[2.5]" />
          <h2 className="text-3xl font-black text-black uppercase tracking-tighter">EMPTY CART!</h2>
          <p className="mt-2 text-gray-500 font-bold text-sm uppercase">EMPTY CART, EMPTY TUMMY. FIX IT FAST! 🍔</p>
          <button
            onClick={() => navigate('/menu')}
            className="w-full mt-6 bg-[#D52518] text-[#FFC926] py-4 rounded-2xl border-[5px] border-black font-black text-xl uppercase shadow-[0_6px_0_0_#000] active:translate-y-1 active:shadow-[0_2px_0_0_#000] transition-all flex justify-center items-center gap-2"
          >
            GRAB YOUR MENU <ArrowRight strokeWidth={4} size={22}/>
          </button>
        </section>
      </main>
    )
  }

  const grandTotal = cart
    .filter(item => selectedIds.includes(item.id))
    .reduce((sum, item) => sum + getItemPrice(item) * (item.qty ?? 1), 0)

  return (
    <main className="min-h-screen w-full bg-[#F3E8CC] p-2 md:p-6 font-sans flex justify-center items-start">
      <section className="w-full max-w-4xl bg-white border-[6px] border-black rounded-[2.5rem] md:rounded-[3rem] p-5 md:p-10 shadow-[10px_10px_0_0_#000] relative mt-10">
        
        {/* Badge Samping */}
        <div className="absolute -top-8 -right-2 md:-top-12 md:-right-4 bg-[#D52518] border-[4px] border-black px-4 py-2 md:px-7 md:py-3 rounded-2xl shadow-[6px_6px_0_0_#FFC926] rotate-6 z-30">
          <span className="font-black text-[#FFC926] text-lg md:text-2xl uppercase italic tracking-tighter">CART</span>
        </div>

        {/* Header Title */}
        <div className="mb-6 border-b-[6px] border-dashed border-black pb-6">
          <h2 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tighter leading-none flex items-center gap-3">
            <ReceiptText size={40} className="text-black stroke-[3]" />
            MY ORDERS
          </h2>
          <p className="text-gray-400 font-bold text-[10px] md:text-xs uppercase mt-2">Check and manage your items before checkout! ✨</p>
        </div>

        {/* Pilih Semua Box */}
        <div className="bg-[#F3E8CC]/50 border-4 border-black rounded-2xl p-4 mb-6 flex items-center gap-4 shadow-[4px_4px_0_0_#000]">
          <button onClick={toggleSelectAll} className="flex-shrink-0 active:scale-90 transition-transform">
            {selectedIds.length === cart.length && cart.length > 0 ? (
              <div className="w-8 h-8 bg-[#D52518] border-4 border-black rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#FFC926" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            ) : (
              <div className="w-8 h-8 border-4 border-black rounded-xl bg-white" />
            )}
          </button>
          <span className="font-black text-black text-base md:text-lg uppercase tracking-wider">SELECT ALL ({cart.length} ITEMS)</span>
        </div>

        {/* Daftar Item */}
        <div className="space-y-5">
          {cart.map((item) => {
            const hasIngredients = Array.isArray(item.ingredients) && item.ingredients.length > 0;
            const isSelected = selectedIds.includes(item.id);
            
            return (
              <article key={item.id} className="bg-white border-4 border-black rounded-2xl p-4 flex items-center gap-4 relative shadow-[6px_6px_0_0_#000]">
                
                <button onClick={() => toggleSelect(item.id)} className="flex-shrink-0 active:scale-90 transition-transform z-10">
                  {isSelected ? (
                    <div className="w-7 h-7 bg-[#D52518] border-4 border-black rounded-lg flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#FFC926" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-7 h-7 border-4 border-black rounded-lg bg-white" />
                  )}
                </button>

                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {hasIngredients ? <BurgerMiniPreview ingredients={item.ingredients} /> : <MenuMiniPreview name={item.name} />}
                  
                  <div className="min-w-0 flex-1 text-left">
                    <h3 className="text-lg md:text-xl font-black text-black uppercase tracking-tight truncate pr-2">{item.name}</h3>
                    <div className="mt-1">
                      {item.modifiers?.length > 0 ? (
                        <p className="text-[11px] font-bold text-gray-500 line-clamp-1 italic">
                          Ingredients: {item.modifiers.map(m => {
                            const rawName = m.ingredient_name || getIngredientNameById(item, m.ingredient_id);
                            const cleanAction = m.action?.toLowerCase() === 'add' ? '' : m.action;
                            return `${cleanAction} ${rawName}`.trim();
                          }).join(', ')}
                        </p>
                      ) : hasIngredients ? (
                        <p className="text-[11px] font-bold text-gray-500 line-clamp-1 italic">
                          Ingredients: {item.ingredients.join(', ')}
                        </p>
                      ) : null}
                    </div>
                    <p className="mt-2 text-lg font-black text-[#D52518] tracking-tight">{formatCurrency(getItemPrice(item))}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between gap-4 self-stretch py-1">
                  <button onClick={() => removeFromCart(item.id)} className="text-black hover:text-[#D52518] transition-colors active:scale-90">
                    <Trash2 size={24} className="stroke-[2.5]" />
                  </button>
                  
                  <div className="flex items-center bg-white border-4 border-black rounded-xl p-0.5 shadow-[3px_3px_0_0_#000]">
                    <button onClick={() => handleDecrease(item)} className="flex h-7 w-7 items-center justify-center bg-white text-black font-black border-2 border-black rounded-md active:scale-75 transition-transform">
                      <Minus size={14} strokeWidth={4} />
                    </button>
                    <span className="w-8 text-center text-sm font-black text-black">{item.qty ?? 1}</span>
                    <button onClick={() => handleIncrease(item)} className="flex h-7 w-7 items-center justify-center bg-[#FFC926] text-black font-black border-2 border-black rounded-md active:scale-75 transition-transform">
                      <Plus size={14} strokeWidth={4} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* --- ADD MORE ORDERS BUTTON (HOVER MERAH/KUNING) --- */}
        <button 
          onClick={() => navigate('/menu')}
          className="w-full mt-8 bg-white border-4 border-black py-4 rounded-2xl font-black text-black text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-[5px_5px_0_0_#000] hover:bg-[#D52518] hover:text-[#FFC926] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_0_#000]"
        >
          <Plus size={20} strokeWidth={4} className="transition-colors" />
          ADD MORE ORDERS
        </button>

        {/* --- PAYMENT & CHECKOUT --- */}
        <div className="mt-6 pt-5 border-t-[5px] border-dashed border-black space-y-3 font-black text-sm uppercase tracking-wide text-black text-left">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-bold text-[11px] md:text-xs">TOTAL ITEMS SELECTED ({selectedIds.length})</span>
            <span className="text-sm md:text-base">{formatCurrency(grandTotal)}</span>
          </div>
          
          <div className="flex justify-between border-t-4 border-black pt-4 text-lg md:text-xl font-black text-black items-center">
            <span className="tracking-tighter">TOTAL PAYMENT</span>
            <span className="text-xl md:text-2xl font-black text-[#D52518] bg-[#FFC926] border-[3px] border-black px-3 py-1 rounded-xl shadow-[3px_3px_0_0_#000] italic">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <button
            disabled={selectedIds.length === 0}
            onClick={() => {
              const selectedItemsToCheckout = cart.filter(item => selectedIds.includes(item.id));
              navigate('/checkout', { state: { checkoutItems: selectedItemsToCheckout } });
            }}
            className={`w-full py-4 rounded-xl border-[4px] border-black font-black text-xl md:text-2xl uppercase flex justify-center items-center gap-2 transition-all ${
              selectedIds.length > 0 
              ? 'bg-[#D52518] text-[#FFC926] shadow-[0_6px_0_0_#000] active:translate-y-1 active:shadow-[0_3px_0_0_#000]' 
              : 'bg-gray-200 text-gray-400 border-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            PROCEED TO CHECKOUT <ArrowRight strokeWidth={4} size={24}/>
          </button>
        </div>
      </section>
    </main>
  )
}

export default Cart
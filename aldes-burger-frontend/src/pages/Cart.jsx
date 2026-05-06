import React, { useState } from 'react'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

// --- IMPORT ASSETS (BURGER) ---
import imgBeefPatty from '../assets/beef_patty.png'
import imgBottomBurger from '../assets/bottom_burger.png'
import imgCheese from '../assets/cheese.png'
import imgChickenPatty from '../assets/chicken_patty.png'
import imgLettuce from '../assets/lettuce.png'
import imgPickles from '../assets/pickles.png'
import imgTomato from '../assets/tomato.png'
import imgTopBurger from '../assets/top_burger.png'

// --- IMPORT ASSETS (MENUS) ---
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
    <div className="relative w-24 h-28 bg-aldesCream/50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center">
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
    const n = itemName.toLowerCase().replace(" ", "_");
    for (const key in menuImageMap) {
      if (n.includes(key)) return menuImageMap[key];
    }
    return null;
  }
  const img = getMenuImage(name);
  return (
    <div className="relative w-24 h-28 bg-aldesCream/50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center p-2">
      {img ? (
        <img src={img} alt={name} className="max-w-full max-h-full object-contain drop-shadow-md" />
      ) : (
        <div className="text-xs text-gray-400 text-center">No Image</div>
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

  const toNumber = (value) => {
    if (typeof value === 'number') return value
    if (typeof value !== 'string') return 0
    return Number(value.replace(/[^\d]/g, '')) || 0
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount)

  const getItemPrice = (item) => toNumber(item.unit_price ?? item.price ?? 0)

  const getIngredientNameById = (item, id) => {
    const list = item.ingredients || []
    const stringId = String(id)
    if (stringId === '1') return list.find(n => n.toLowerCase().includes('beef')) || 'Beef Patty'
    if (stringId === '2') return list.find(n => n.toLowerCase().includes('chicken')) || 'Chicken Patty'
    if (stringId === '3') return list.find(n => n.toLowerCase().includes('cheese')) || 'Cheese'
    if (stringId === '4') return list.find(n => n.toLowerCase().includes('pickle')) || 'Pickles'
    if (stringId === '5') return list.find(n => n.toLowerCase().includes('lettuce')) || 'Lettuce'
    if (stringId === '6') return list.find(n => n.toLowerCase().includes('tomato')) || 'Tomato'
    if (stringId === '7') return list.find(n => n.toLowerCase().includes('top')) || 'Top Bun'
    if (stringId === '8') return list.find(n => n.toLowerCase().includes('bottom')) || 'Bottom Bun'
    return `Item #${id}`
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === cart.length && cart.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(cart.map(item => item.id))
    }
  }

  const handleIncrease = (item) => {
    if (updateQty) updateQty(item.id, (item.qty ?? 1) + 1)
  }

  const handleDecrease = (item) => {
    const nextQty = (item.qty ?? 1) - 1
    if (nextQty <= 0) {
      removeFromCart(item.id)
    } else if (updateQty) {
      updateQty(item.id, nextQty)
    }
  }

  if (!Array.isArray(cart) || cart.length === 0) {
    return (
      <main className="bg-aldesCream min-h-screen pb-32 px-4 py-8">
        <section className="mx-auto max-w-3xl rounded-xl bg-white p-8 text-center shadow">
          <h2 className="text-2xl font-bold text-aldesRed">Your cart is empty</h2>
          <p className="mt-2 text-gray-600">Looks like you have not added any items yet.</p>
          <button
            onClick={() => navigate('/menu')}
            className="mt-6 rounded-xl bg-aldesRed px-6 py-3 font-semibold text-white transition hover:brightness-110"
          >
            Browse Menu
          </button>
        </section>
      </main>
    )
  }

  const grandTotal = cart
    .filter(item => selectedIds.includes(item.id))
    .reduce((sum, item) => sum + getItemPrice(item) * (item.qty ?? 1), 0)

  return (
    <div className="bg-aldesCream flex flex-col min-h-full">
      <div className="px-4 py-6 flex-grow">
        <div className="mx-auto w-full max-w-4xl">
          
          <div className="bg-white rounded-xl shadow p-4 mb-4 flex items-center gap-3">
            <button onClick={toggleSelectAll} className="flex-shrink-0">
              {selectedIds.length === cart.length && cart.length > 0 ? (
                <div className="w-6 h-6 bg-aldesRed rounded-full flex items-center justify-center transition-all">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              ) : (
                <div className="w-6 h-6 border-2 border-gray-300 rounded-full bg-white" />
              )}
            </button>
            <span className="font-bold text-gray-900 text-base">Select All ({cart.length})</span>
          </div>

          <section className="mb-6">
            {cart.map((item) => {
              const hasIngredients = Array.isArray(item.ingredients) && item.ingredients.length > 0;
              const isSelected = selectedIds.includes(item.id);
              
              return (
                <article key={item.id} className="bg-white rounded-xl shadow p-4 mb-4 flex items-center gap-4">
                  <button onClick={() => toggleSelect(item.id)} className="flex-shrink-0">
                    {isSelected ? (
                      <div className="w-6 h-6 bg-aldesRed rounded-full flex items-center justify-center transition-all">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full bg-white" />
                    )}
                  </button>

                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {hasIngredients ? <BurgerMiniPreview ingredients={item.ingredients} /> : <MenuMiniPreview name={item.name} />}
                    
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-gray-900 truncate">{item.name}</h3>
                      
                      <div className="mt-1">
                        {item.modifiers?.length > 0 ? (
                          <p className="text-[10px] text-gray-500 line-clamp-1 italic">
                            Ingridients: {item.modifiers.map(m => {
                              const rawName = m.ingredient_name || getIngredientNameById(item, m.ingredient_id);
                              const cleanAction = m.action?.toLowerCase() === 'add' ? '' : m.action;
                              return `${cleanAction} ${rawName}`.trim();
                            }).join(', ')}
                          </p>
                        ) : hasIngredients ? (
                          <p className="text-[10px] text-gray-500 line-clamp-1 italic">
                            Ingredients: {item.ingredients.join(', ')}
                          </p>
                        ) : null}
                      </div>

                      <p className="mt-2 text-sm font-bold text-aldesRed">{formatCurrency(getItemPrice(item))}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-aldesCream/50 p-1 rounded-lg">
                      <button onClick={() => handleDecrease(item)} className="flex h-7 w-7 items-center justify-center rounded-md bg-white border border-aldesRed text-aldesRed active:scale-90 transition-transform"><Minus className="h-3 w-3" /></button>
                      <span className="w-5 text-center text-sm font-bold text-gray-800">{item.qty ?? 1}</span>
                      <button onClick={() => handleIncrease(item)} className="flex h-7 w-7 items-center justify-center rounded-md bg-white border border-aldesRed text-aldesRed active:scale-90 transition-transform"><Plus className="h-3 w-3" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="ml-2 text-gray-400 hover:text-aldesRed transition-colors"><Trash2 className="h-5 w-5" /></button>
                  </div>
                </article>
              );
            })}

            <button 
              onClick={() => navigate('/menu')}
              className="w-full mt-2 py-2 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-500 text-[15px] font-bold flex items-center justify-center gap-2 hover:border-aldesRed hover:text-aldesRed transition-colors active:scale-[0.98]"
            >
              <Plus className="h-5 w-5" />
              Add more orders
            </button>
          </section>
        </div>
      </div>

      <section className="sticky bottom-0 w-full bg-white shadow-[0_-8px_20px_rgba(0,0,0,0.08)] p-4 z-40 border-t border-gray-100">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold italic tracking-wider">
              Total Payment ({selectedIds.length} items)
            </p>
            <p className="text-2xl font-black text-aldesRed leading-tight">
              {formatCurrency(grandTotal)}
            </p>
          </div>
          <button
            disabled={selectedIds.length === 0}
            onClick={() => navigate('/checkout')}
            className={`px-10 py-3.5 rounded-2xl font-black text-lg transition-all ${
              selectedIds.length > 0 
              ? 'bg-aldesRed text-white shadow-lg shadow-red-100 active:scale-95' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Checkout
          </button>
        </div>
      </section>
    </div>
  )
}

export default Cart
import React, { useState } from 'react'
import {
  Minus,
  Plus,
  Trash2,
  ReceiptText,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react'
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
import imgKetchup from '../assets/ketchup.png'
import imgMayonnaise from '../assets/mayonnaise.png'
import imgSecretSauce from '../assets/secret_sauce.png'
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
  'secret sauce': imgSecretSauce,
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
  if (n.includes('pickle') || n.includes('tomato') || n.includes('cheese'))
    return 1
  if (
    n.includes('bottom') ||
    n.includes('ketchup') ||
    n.includes('mayonnaise') ||
    n.includes('secret sauce')
  )
    return 2
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
  const scaleValue =
    ingredients.length > 8 ? 0.65 : ingredients.length > 6 ? 0.8 : 1

  return (
    <div className="relative w-16 h-16 md:w-20 md:h-20 bg-aldesCream/50 border-4 border-black rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center shadow-[4px_4px_0_0_#000]">
      <div
        className="absolute bottom-2 w-full flex justify-center items-end"
        style={{
          transform: `scale(${scaleValue})`,
          transformOrigin: 'bottom',
        }}
      >
        {ingredients.map((name, index) => {
          const img = getIngredientImage(name)
          const thickness = getIngredientThickness(name)
          const pos = currentBottom
          currentBottom += thickness

          return (
            <div
              key={index}
              className="absolute left-1/2 -translate-x-1/2 w-12 md:w-14"
              style={{
                bottom: `${pos + getVisualOffset(name)}px`,
                zIndex: index,
              }}
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
    if (!itemName) return null
    const n = itemName.toLowerCase().replace(' ', '_')

    for (const key in menuImageMap) {
      if (n.includes(key)) return menuImageMap[key]
    }

    return null
  }

  const img = getMenuImage(name)

  return (
    <div className="relative w-16 h-16 md:w-20 md:h-20 bg-aldesCream/50 border-4 border-black rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2 shadow-[4px_4px_0_0_#000]">
      {img ? (
        <img src={img} alt={name} className="max-w-12 max-h-12 object-contain" />
      ) : (
        <div className="text-[10px] font-black text-black text-center uppercase">
          No Img
        </div>
      )}
    </div>
  )
}

function Cart() {
  const navigate = useNavigate()
  const contextValue = useCart()

  const cart = contextValue?.cart ?? []
  const removeFromCart = contextValue?.removeFromCart ?? (() => {})
  const updateQty = contextValue?.updateQty

  const [selectedIds, setSelectedIds] = useState([])

  const handleIncrease = (item) => updateQty(item.id, (item.qty ?? 1) + 1)

  const handleDecrease = (item) => {
    if ((item.qty ?? 1) > 1) {
      updateQty(item.id, (item.qty ?? 1) - 1)
    } else {
      removeFromCart(item.id)
    }
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount)

  const getItemPrice = (item) =>
    Number(
      (item.unit_price ?? item.price ?? 0).toString().replace(/[^\d]/g, '')
    ) || 0

  const toggleSelect = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )

  const toggleSelectAll = () =>
    selectedIds.length === cart.length && cart.length > 0
      ? setSelectedIds([])
      : setSelectedIds(cart.map((i) => i.id))

  const grandTotal = cart
    .filter((item) => selectedIds.includes(item.id))
    .reduce((sum, item) => sum + getItemPrice(item) * (item.qty ?? 1), 0)

  return (
    <main className="min-h-screen w-full bg-aldesCream p-2 md:p-6 font-sans flex justify-center items-start">
      <section className="w-full max-w-4xl bg-white border-[6px] border-black rounded-[2.5rem] md:rounded-[3rem] p-5 md:p-10 shadow-[10px_10px_0_0_#000] relative mt-10">

        {/* Badge */}
        <div className="absolute -top-8 -right-2 md:-top-12 md:-right-4 bg-aldesRed border-[4px] border-black px-4 py-2 md:px-7 md:py-3 rounded-2xl shadow-[6px_6px_0_0_#FFC926] rotate-6 z-30">
          <span className="font-black text-aldesYellow text-base md:text-xl uppercase italic tracking-tighter">
            CART
          </span>
        </div>

        {/* Header */}
        <div className="mb-6 border-b-[6px] border-dashed border-black pb-6">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight flex items-center gap-3">
            <ReceiptText size={40} />
            MY ORDERS
          </h2>

          <p className="text-gray-400 font-bold text-xs md:text-sm uppercase mt-2 tracking-wide">
            CHECK AND MANAGE YOUR ITEMS BEFORE CHECKOUT! ✨
          </p>
        </div>

        {/* Select All */}
        <div className="bg-aldesCream/50 border-4 border-black rounded-2xl p-4 mb-6 flex items-center gap-4 shadow-[4px_4px_0_0_#000]">
          <button onClick={toggleSelectAll}>
            {selectedIds.length === cart.length && cart.length > 0 ? (
              <div className="w-7 h-7 bg-aldesRed border-4 border-black rounded-xl flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFC926"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            ) : (
              <div className="w-7 h-7 border-4 border-black rounded-xl bg-white" />
            )}
          </button>

          <span className="font-black text-sm md:text-base uppercase tracking-wide">
            SELECT ALL ({cart.length} ITEMS)
          </span>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {cart.map((item) => {
            const hasIngredients =
              Array.isArray(item.ingredients) && item.ingredients.length > 0
            const isSelected = selectedIds.includes(item.id)

            return (
              <article
                key={item.id}
                className="bg-white border-4 border-black rounded-2xl p-3 flex items-center gap-3 shadow-[6px_6px_0_0_#000]"
              >
                <button onClick={() => toggleSelect(item.id)}>
                  {isSelected ? (
                    <div className="w-6 h-6 bg-aldesRed border-4 border-black rounded-lg flex items-center justify-center">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#FFC926"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 border-4 border-black rounded-lg bg-white" />
                  )}
                </button>

                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {hasIngredients ? (
                    <BurgerMiniPreview ingredients={item.ingredients} />
                  ) : (
                    <MenuMiniPreview name={item.name} />
                  )}

                  <div className="min-w-0 flex-1 text-left">
                    <h3 className="text-sm md:text-base font-black uppercase truncate">
                      {item.name}
                    </h3>

                    {hasIngredients && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.ingredients.map((name, i) => (
                          <span
                            key={i}
                            className="text-[9px] md:text-[10px] font-bold bg-aldesCream px-2 py-0.5 rounded-full border border-black/10"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="mt-2 text-sm md:text-lg font-black italic text-aldesRed">
                      {formatCurrency(getItemPrice(item))}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <button onClick={() => removeFromCart(item.id)}>
                    <Trash2 size={20} />
                  </button>

                  <div className="flex items-center bg-white border-4 border-black rounded-xl p-0.5 shadow-[3px_3px_0_0_#000]">
                    <button
                      onClick={() => handleDecrease(item)}
                      className="flex h-6 w-6 md:h-7 md:w-7 items-center justify-center border-2 border-black rounded-md"
                    >
                      <Minus size={12} strokeWidth={4} />
                    </button>

                    <span className="w-8 text-center text-sm md:text-base font-black">
                      {item.qty ?? 1}
                    </span>

                    <button
                      onClick={() => handleIncrease(item)}
                      className="flex h-6 w-6 md:h-7 md:w-7 items-center justify-center bg-aldesYellow border-2 border-black rounded-md"
                    >
                      <Plus size={12} strokeWidth={4} />
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {/* Add More */}
        <button
          onClick={() => navigate('/menu')}
          className="w-full mt-8 bg-white border-4 border-black py-4 rounded-2xl font-black text-sm md:text-base uppercase tracking-wide flex items-center justify-center gap-2 shadow-[5px_5px_0_0_#000]"
        >
          <Plus size={20} strokeWidth={4} />
          ADD MORE ORDERS
        </button>

        {/* Payment */}
        <div className="mt-6 pt-5 border-t-[5px] border-dashed border-black space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-bold text-xs md:text-sm tracking-wide">
              TOTAL ITEMS SELECTED ({selectedIds.length})
            </span>

            <span className="text-sm md:text-base font-black">
              {formatCurrency(grandTotal)}
            </span>
          </div>

          <div className="flex justify-between border-t-4 border-black pt-4 items-center">
            <span className="text-base md:text-lg font-black tracking-tight">
              TOTAL PAYMENT
            </span>

            <span className="text-lg md:text-2xl font-black text-aldesRed bg-aldesYellow border-[3px] border-black px-3 py-1 rounded-xl shadow-[3px_3px_0_0_#000] italic">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>

        {/* Checkout */}
        <div className="mt-6">
          <button
            disabled={selectedIds.length === 0}
            className={`w-full py-4 rounded-xl border-[4px] border-black font-black text-lg md:text-xl uppercase tracking-tight flex justify-center items-center gap-2 ${
              selectedIds.length > 0
                ? 'bg-aldesRed text-aldesYellow shadow-[0_6px_0_0_#000]'
                : 'bg-gray-200 text-gray-400 border-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            PROCEED TO CHECKOUT <ArrowRight strokeWidth={4} size={24} />
          </button>
        </div>
      </section>
    </main>
  )
}

export default Cart
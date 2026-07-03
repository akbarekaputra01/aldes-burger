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
  const img =
    menuImageMap[name?.toLowerCase().replace(' ', '_')] || null

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
  const { cart = [], removeFromCart = () => {}, updateQty } = useCart() || {}

  const [selectedIds, setSelectedIds] = useState([])

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

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === cart.length && cart.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(cart.map((item) => item.id))
    }
  }

  const handleIncrease = (item) => {
    updateQty(item.id, (item.qty ?? 1) + 1)
  }

  const handleDecrease = (item) => {
    if ((item.qty ?? 1) > 1) {
      updateQty(item.id, (item.qty ?? 1) - 1)
    } else {
      removeFromCart(item.id)
      setSelectedIds((prev) => prev.filter((id) => id !== item.id))
    }
  }

  const handleRemove = (id) => {
    removeFromCart(id)
    setSelectedIds((prev) => prev.filter((itemId) => itemId !== id))
  }

  const grandTotal = cart
    .filter((item) => selectedIds.includes(item.id))
    .reduce((sum, item) => sum + getItemPrice(item) * (item.qty ?? 1), 0)

  const handleCheckout = () => {
    const selectedItems = cart.filter((item) =>
      selectedIds.includes(item.id)
    )

    navigate('/checkout', {
      state: {
        selectedItems,
      },
    })
  }

  return (
    <main className="min-h-screen w-full bg-aldesCream p-2 md:p-6 font-sans flex justify-center items-start">
      <section className="w-full max-w-4xl bg-white border-[6px] border-black rounded-[2.5rem] md:rounded-[3rem] p-5 md:p-10 shadow-[10px_10px_0_0_#000] relative mt-10">

        {/* Badge */}
        <div className="absolute -top-8 -right-2 bg-aldesRed border-[4px] border-black px-5 py-2 rounded-2xl shadow-[6px_6px_0_0_#FFC926] rotate-6 z-30">
          <span className="font-black text-aldesYellow text-lg uppercase italic">
            CART
          </span>
        </div>

        {/* Header */}
        <div className="mb-6 border-b-[6px] border-dashed border-black pb-6">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight flex items-center gap-3">
            <ReceiptText size={40} />
            MY ORDERS
          </h2>
        </div>

        {cart.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-center">
            <ShoppingBag size={70} strokeWidth={2.5} />
            <h3 className="mt-4 text-2xl font-black uppercase">
              Your Tray Is Empty!
            </h3>
            <p className="text-gray-400 font-bold mt-2">
              Add some delicious burgers first 🍔
            </p>

            <button
              onClick={() => navigate('/menu')}
              className="mt-6 bg-aldesYellow border-4 border-black px-6 py-3 rounded-2xl font-black shadow-[5px_5px_0_0_#000]"
            >
              ORDER NOW
            </button>
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="bg-aldesCream/50 border-4 border-black rounded-2xl p-4 mb-6 flex items-center gap-4 shadow-[4px_4px_0_0_#000]">
              <button onClick={toggleSelectAll}>
                <div className="w-7 h-7 border-4 border-black rounded-xl bg-white flex items-center justify-center font-black">
                  {selectedIds.length === cart.length &&
                    cart.length > 0 &&
                    '✓'}
                </div>
              </button>

              <span className="font-black uppercase">
                SELECT ALL ({cart.length})
              </span>
            </div>

            {/* Items */}
            <div className="space-y-4">
              {cart.map((item) => {
                const hasIngredients =
                  Array.isArray(item.ingredients) &&
                  item.ingredients.length > 0

                const isSelected = selectedIds.includes(item.id)

                return (
                  <article
                    key={item.id}
                    className={`relative border-4 border-black rounded-2xl p-4 flex items-center gap-4 shadow-[6px_6px_0_0_#000] ${
                      isSelected ? 'bg-aldesCream/30' : 'bg-white'
                    }`}
                  >
                    <div
                      className={`absolute left-0 top-0 h-full w-3 rounded-l-xl ${
                        isSelected ? 'bg-aldesRed' : 'bg-aldesYellow'
                      }`}
                    />

                    <button onClick={() => toggleSelect(item.id)}>
                      <div className="w-6 h-6 border-4 border-black rounded-lg bg-white flex items-center justify-center font-black">
                        {isSelected && '✓'}
                      </div>
                    </button>

                    {hasIngredients ? (
                      <BurgerMiniPreview ingredients={item.ingredients} />
                    ) : (
                      <MenuMiniPreview name={item.name} />
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-black uppercase truncate">
                        {item.name}
                      </h3>

                      <p className="mt-2 text-lg font-black italic text-aldesRed">
                        {formatCurrency(getItemPrice(item))}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="bg-aldesRed p-2 rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] hover:scale-105 transition-all"
                      >
                        <Trash2 size={16} color="#FFC926" />
                      </button>

                      <div className="flex items-center bg-white border-4 border-black rounded-xl p-1 shadow-[3px_3px_0_0_#000]">
                        <button
                          onClick={() => handleDecrease(item)}
                          className="w-7 h-7 border-2 border-black rounded-md flex items-center justify-center"
                        >
                          <Minus size={12} strokeWidth={4} />
                        </button>

                        <span className="w-8 text-center font-black">
                          {item.qty ?? 1}
                        </span>

                        <button
                          onClick={() => handleIncrease(item)}
                          className="w-7 h-7 bg-aldesYellow border-2 border-black rounded-md flex items-center justify-center"
                        >
                          <Plus size={12} strokeWidth={4} />
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            {/* Checkout */}
            <div className="mt-8 border-t-[5px] border-dashed border-black pt-6">
              <div className="flex justify-between mb-4">
                <span className="font-bold uppercase text-sm text-gray-400">
                  Total Selected ({selectedIds.length})
                </span>

                <span className="font-black text-lg">
                  {formatCurrency(grandTotal)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={selectedIds.length === 0}
                className={`w-full py-5 rounded-2xl border-[4px] border-black font-black text-lg uppercase flex justify-center items-center gap-3 transition-all ${
                  selectedIds.length > 0
                    ? 'bg-aldesRed text-aldesYellow shadow-[0_8px_0_0_#000] active:translate-y-[4px] active:shadow-[0_4px_0_0_#000]'
                    : 'bg-gray-200 text-gray-400 border-gray-400 cursor-not-allowed'
                }`}
              >
                <ShoppingBag size={24} />
                PROCEED TO CHECKOUT
                <ArrowRight strokeWidth={4} size={24} />
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  )
}

export default Cart
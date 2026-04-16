import { Minus, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const allIngredients = [
    { id: 'bun_top', name: 'Top Bun', price: 0, type: 'bun', availableIn: ['beef', 'chicken', 'custom'] },
    { id: 'beef_patty', name: 'Beef Patty', price: 15000, type: 'protein', availableIn: ['beef', 'custom'] },
    { id: 'chicken_patty', name: 'Crispy Chicken', price: 12000, type: 'protein', availableIn: ['chicken', 'custom'] },
    { id: 'cheese', name: 'Cheddar Cheese', price: 5000, type: 'extra', availableIn: ['beef', 'chicken', 'custom'] },
    { id: 'lettuce', name: 'Lettuce', price: 2000, type: 'veg', availableIn: ['beef', 'chicken', 'custom'] },
    { id: 'tomato', name: 'Tomato', price: 2000, type: 'veg', availableIn: ['beef', 'custom'] },
    { id: 'bun_bottom', name: 'Bottom Bun', price: 0, type: 'bun', availableIn: ['beef', 'chicken', 'custom'] },

]

function Kitchen() {
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const currentMode = 'beef'
  const initialSelected = ['bun_bottom', 'beef_patty', 'cheese', 'lettuce', 'tomato', 'bun_top']

  const [selectedIngredients, setSelectedIngredients] = useState(initialSelected)
  const [qty, setQty] = useState(1)

  const filteredIngredients = useMemo(
    () => allIngredients.filter((ingredient) => ingredient.availableIn.includes(currentMode)),
    [currentMode],
  )

  const selectedIngredientObjects = useMemo(
    () => allIngredients.filter((ingredient) => selectedIngredients.includes(ingredient.id)),
    [selectedIngredients],
  )

  const totalPrice = useMemo(() => {
    const ingredientPrice = selectedIngredientObjects.reduce((sum, ingredient) => sum + ingredient.price, 0)
    return ingredientPrice * qty
  }, [qty, selectedIngredientObjects])

  const formatRupiah = (amount) => `Rp ${amount.toLocaleString('id-ID')}`

  const toggleIngredient = (ingredientId) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredientId) ? prev.filter((id) => id !== ingredientId) : [...prev, ingredientId],
    )
  }

  const increaseQty = () => setQty((prev) => prev + 1)
  const decreaseQty = () => setQty((prev) => Math.max(1, prev - 1))

  const handleAddToCart = () => {
    addToCart({
      id: `custom-${Date.now()}`,
      name: currentMode === 'beef' ? 'Configured Beef Burger' : 'Configured Burger',
      price: totalPrice,
      qty: 1,
      ingredients: selectedIngredientObjects.map((item) => item.name),
    })
    navigate('/')
  }

  return (
    <main className="min-h-screen bg-aldesCream px-4 py-8 sm:px-6">
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-12">
        <article className="rounded-3xl bg-white p-6 shadow-md lg:col-span-7 lg:p-8">
          <p className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700">Universal Kitchen Modifiers</p>
          <h1 className="mt-3 text-2xl font-black text-gray-900">Build your premium burger</h1>
          <p className="mt-1 text-sm text-gray-500">Live visual summary updates as your kitchen modifiers change.</p>

          <div className="mt-6 rounded-3xl border-2 border-dashed border-red-200 bg-amber-50/50 p-5">
            <div className="space-y-3">
              {selectedIngredientObjects.length > 0 ? (
                selectedIngredientObjects.map((ingredient, index) => (
                  <div key={`${ingredient.id}-${index}`} className="rounded-2xl border border-red-100 bg-white px-4 py-3 text-center font-semibold text-gray-700 shadow-sm">
                    {ingredient.name}
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-white px-4 py-6 text-center font-semibold text-gray-500">No ingredients selected.</p>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-red-50 p-4">
            <p className="text-sm font-semibold text-gray-900">Current stack</p>
            <p className="mt-1 text-sm text-gray-600">{selectedIngredientObjects.map((ingredient) => ingredient.name).join(' • ') || 'No ingredients selected'}</p>
          </div>
        </article>

        <aside className="rounded-3xl bg-white p-6 shadow-md lg:col-span-5 lg:p-7">
          <h2 className="text-xl font-black text-gray-900">Ingredient controls</h2>
          <p className="mt-1 text-sm text-gray-500">Use ADD/REMOVE actions for each ingredient.</p>

          <div className="mt-4 max-h-[460px] space-y-3 overflow-y-auto pr-1">
            {filteredIngredients.map((ingredient) => {
              const isActive = selectedIngredients.includes(ingredient.id)
              return (
                <div key={ingredient.id} className="rounded-2xl border border-red-100 bg-amber-50/30 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-900">{ingredient.name}</p>
                      <p className="text-xs capitalize text-gray-500">{ingredient.type}</p>
                      <p className="mt-1 text-sm font-semibold text-red-600">{formatRupiah(ingredient.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => !isActive && toggleIngredient(ingredient.id)} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition enabled:hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-45" disabled={isActive}>
                        ADD
                      </button>
                      <button type="button" onClick={() => isActive && toggleIngredient(ingredient.id)} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white transition enabled:hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-45" disabled={!isActive}>
                        REMOVE
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold text-gray-800">Quantity</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={decreaseQty} className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-700"><Minus className="h-4 w-4" /></button>
                <span className="min-w-8 text-center text-lg font-bold text-gray-900">{qty}</span>
                <button type="button" onClick={increaseQty} className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-700"><Plus className="h-4 w-4" /></button>
              </div>
            </div>

            <button type="button" onClick={handleAddToCart} className="w-full rounded-2xl bg-red-600 py-3 text-lg font-bold text-white transition hover:bg-red-700">
              Add to Cart · {formatRupiah(totalPrice)}
            </button>
          </div>
        </aside>
      </section>
    </main>
  )
}

export default Kitchen

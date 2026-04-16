import { useMemo, useState } from 'react'
import { Check, WandSparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/useCart'

const allIngredients = [
  { id: 'bun_top', name: 'Top Bun', price: 0, type: 'bun', availableIn: ['beef', 'chicken', 'custom'] },
  { id: 'beef_patty', name: 'Beef Patty', price: 15000, type: 'protein', availableIn: ['beef', 'custom'] },
  { id: 'chicken_patty', name: 'Crispy Chicken', price: 12000, type: 'protein', availableIn: ['chicken', 'custom'] },
  { id: 'cheese', name: 'Cheddar Cheese', price: 5000, type: 'extra', availableIn: ['beef', 'chicken', 'custom'] },
  { id: 'lettuce', name: 'Lettuce', price: 2000, type: 'veg', availableIn: ['beef', 'chicken', 'custom'] },
  { id: 'tomato', name: 'Tomato', price: 2000, type: 'veg', availableIn: ['beef', 'custom'] },
  { id: 'onion', name: 'Onion', price: 1000, type: 'veg', availableIn: ['beef', 'chicken', 'custom'] },
  { id: 'special_sauce', name: 'Special Sauce', price: 3000, type: 'sauce', availableIn: ['beef', 'chicken', 'custom'] },
  { id: 'bun_bottom', name: 'Bottom Bun', price: 0, type: 'bun', availableIn: ['beef', 'chicken', 'custom'] },
]

function Kitchen() {
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const currentMode = 'custom'
  const initialSelected = ['bun_bottom', 'beef_patty', 'cheese', 'lettuce', 'tomato', 'special_sauce', 'bun_top']

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

  const handleAddToCart = () => {
    addToCart({
      id: `custom-${Date.now()}`,
      name: 'Custom Burger by You',
      price: totalPrice,
      qty: 1,
      ingredients: selectedIngredientObjects.map((item) => item.name),
    })
    navigate('/cart')
  }

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
      <section className="glass-card p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="pill">
              <WandSparkles className="h-3.5 w-3.5" /> interactive builder
            </p>
            <h1 className="mt-3 text-3xl font-black text-aldesRed md:text-4xl">Kitchen Studio</h1>
            <p className="mt-1 text-sm text-slate-600">Pilih bahan, lihat komposisi live, lalu masukkan ke keranjang.</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-aldesRed/10 bg-gradient-to-b from-white to-aldesCream/30 p-6">
          <div className="mx-auto flex min-h-[340px] max-w-md flex-col-reverse items-center justify-center gap-2">
            {selectedIngredientObjects.length > 0 ? (
              selectedIngredientObjects.map((ingredient, index) => (
                <div
                  key={`${ingredient.id}-${index}`}
                  className="w-full rounded-2xl border border-aldesRed/15 bg-white px-4 py-2.5 text-center text-sm font-bold text-slate-700 shadow"
                >
                  {ingredient.name}
                </div>
              ))
            ) : (
              <p className="font-semibold text-aldesRed">No ingredients selected.</p>
            )}
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600">
          <span className="font-bold text-aldesRed">Layer:</span>{' '}
          {selectedIngredientObjects.length > 0
            ? selectedIngredientObjects.map((ingredient) => ingredient.name).join(', ')
            : 'Belum ada ingredients dipilih'}
        </p>
      </section>

      <aside className="glass-card h-fit p-5">
        <h2 className="text-xl font-black text-aldesRed">Ingredients</h2>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {filteredIngredients.map((ingredient) => {
            const isActive = selectedIngredients.includes(ingredient.id)
            return (
              <button
                key={ingredient.id}
                type="button"
                onClick={() => toggleIngredient(ingredient.id)}
                className={`rounded-2xl border p-3 text-left transition ${
                  isActive ? 'border-aldesRed bg-aldesYellow/30 shadow' : 'border-aldesRed/10 bg-white hover:border-aldesRed/30'
                }`}
              >
                <p className="text-sm font-black text-slate-800">{ingredient.name}</p>
                <p className="mt-1 text-xs capitalize text-slate-500">{ingredient.type}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-aldesRed">{formatRupiah(ingredient.price)}</span>
                  {isActive && <Check className="h-4 w-4 text-aldesRed" />}
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-5 rounded-2xl border border-aldesRed/15 bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-bold text-slate-700">Quantity</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setQty((prev) => Math.max(1, prev - 1))} className="rounded-xl border border-aldesRed/30 px-3 py-1.5 font-black text-aldesRed">
                -
              </button>
              <span className="min-w-8 text-center text-lg font-black">{qty}</span>
              <button type="button" onClick={() => setQty((prev) => prev + 1)} className="rounded-xl border border-aldesRed/30 px-3 py-1.5 font-black text-aldesRed">
                +
              </button>
            </div>
          </div>

          <button type="button" onClick={handleAddToCart} className="btn-primary w-full">
            Add to Cart • {formatRupiah(totalPrice)}
          </button>
        </div>
      </aside>
    </main>
  )
}

export default Kitchen

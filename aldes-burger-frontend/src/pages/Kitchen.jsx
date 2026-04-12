import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function Kitchen() {
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const allIngredients = [
    { id: 'bun_top', name: 'Top Bun', price: 0, type: 'bun', availableIn: ['beef', 'chicken', 'custom'] },
    { id: 'beef_patty', name: 'Beef Patty', price: 15000, type: 'protein', availableIn: ['beef', 'custom'] },
    { id: 'chicken_patty', name: 'Crispy Chicken', price: 12000, type: 'protein', availableIn: ['chicken', 'custom'] },
    { id: 'cheese', name: 'Cheddar Cheese', price: 5000, type: 'extra', availableIn: ['beef', 'chicken', 'custom'] },
    { id: 'lettuce', name: 'Lettuce', price: 2000, type: 'veg', availableIn: ['beef', 'chicken', 'custom'] },
    { id: 'tomato', name: 'Tomato', price: 2000, type: 'veg', availableIn: ['beef', 'custom'] },
    { id: 'bun_bottom', name: 'Bottom Bun', price: 0, type: 'bun', availableIn: ['beef', 'chicken', 'custom'] },
  ]

  const currentMode = 'beef'
  const initialSelected = ['bun_bottom', 'beef_patty', 'cheese', 'lettuce', 'tomato', 'bun_top']

  const [selectedIngredients, setSelectedIngredients] = useState(initialSelected)
  const [qty, setQty] = useState(1)

  const filteredIngredients = useMemo(
    () => allIngredients.filter((ingredient) => ingredient.availableIn.includes(currentMode)),
    [allIngredients, currentMode],
  )

  const selectedIngredientObjects = useMemo(
    () => allIngredients.filter((ingredient) => selectedIngredients.includes(ingredient.id)),
    [allIngredients, selectedIngredients],
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
    <main className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 p-6 md:grid-cols-12">
      <section className="rounded-3xl border border-aldesRed/10 bg-white p-8 shadow-lg md:col-span-7 lg:col-span-8">
        <h2 className="text-2xl font-extrabold text-aldesRed">Your Burger Preview</h2>
        <p className="mt-1 text-sm text-gray-600">Susun burger sesuai selera dan lihat komposisinya langsung.</p>

        <div className="mt-8 flex min-h-[380px] flex-col-reverse items-center justify-center gap-3 rounded-3xl border border-dashed border-aldesRed/20 bg-gradient-to-b from-aldesCream/30 to-white p-6">
          {selectedIngredientObjects.length > 0 ? (
            selectedIngredientObjects.map((ingredient, index) => (
              <div
                key={`${ingredient.id}-${index}`}
                className="w-full max-w-md rounded-xl border border-aldesRed/20 bg-white px-4 py-3 text-center text-sm font-semibold text-gray-700 shadow-sm"
              >
                {ingredient.name}
              </div>
            ))
          ) : (
            <p className="text-center font-semibold text-aldesRed">No ingredients selected.</p>
          )}
        </div>

        <p className="mt-6 text-sm text-gray-700">
          <span className="font-bold text-aldesRed">Contains:</span>{' '}
          {selectedIngredientObjects.length > 0
            ? selectedIngredientObjects.map((ingredient) => ingredient.name).join(', ')
            : 'No ingredients selected'}
        </p>
      </section>

      <aside className="rounded-3xl border border-aldesRed/10 bg-white p-4 shadow-lg md:col-span-5 lg:col-span-4">
        <h3 className="text-xl font-extrabold text-aldesRed">Choose Ingredients</h3>
        <p className="mb-4 mt-1 text-sm text-gray-700">Tap ingredient card untuk tambah/kurangi isi burger.</p>

        <div className="grid grid-cols-2 gap-3">
          {filteredIngredients.map((ingredient) => {
            const isActive = selectedIngredients.includes(ingredient.id)
            return (
              <button
                key={ingredient.id}
                type="button"
                onClick={() => toggleIngredient(ingredient.id)}
                className={`rounded-xl p-3 text-left transition ${
                  isActive
                    ? 'border-2 border-aldesRed bg-aldesYellow/20 shadow-sm'
                    : 'border border-gray-300 bg-white hover:border-aldesYellow'
                }`}
              >
                <p className="font-bold text-gray-900">{ingredient.name}</p>
                <p className="mt-1 text-xs capitalize text-gray-500">{ingredient.type}</p>
                <p className="mt-1 text-sm font-semibold text-aldesRed">{formatRupiah(ingredient.price)}</p>
              </button>
            )
          })}
        </div>

        <div className="sticky bottom-0 mt-6 rounded-2xl border border-aldesYellow bg-aldesCream/30 p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-bold text-gray-800">Quantity</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={decreaseQty} className="rounded-xl border border-aldesRed px-3 py-1 font-bold text-aldesRed">
                -
              </button>
              <span className="min-w-8 text-center text-lg font-bold text-gray-900">{qty}</span>
              <button type="button" onClick={increaseQty} className="rounded-xl border border-aldesRed px-3 py-1 font-bold text-aldesRed">
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full rounded-xl bg-aldesRed py-3 text-lg font-bold text-white transition hover:brightness-110"
          >
            Add to Cart - {formatRupiah(totalPrice)}
          </button>
        </div>
      </aside>
    </main>
  )
}

export default Kitchen

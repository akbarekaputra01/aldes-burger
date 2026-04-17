import { Loader2, Minus, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import api from '../lib/api'

function Kitchen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { addToCart } = useCart()

  const [allMenus, setAllMenus] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [qty, setQty] = useState(1)
  const [isFetching, setIsFetching] = useState(true)

  const menuId = location.state?.menuId
  const selectedMenu = useMemo(() => allMenus.find((menu) => menu.id === menuId) ?? allMenus.find((menu) => menu.is_custom) ?? allMenus[0], [allMenus, menuId])

  const defaultIngredientIds = useMemo(() => (selectedMenu?.ingredients ?? []).map((item) => item.id), [selectedMenu])

  useEffect(() => {
    const load = async () => {
      setIsFetching(true)
      const [menusRes, ingredientsRes] = await Promise.all([api.get('/menus'), api.get('/ingredients')])
      setAllMenus(menusRes.data)
      setIngredients(ingredientsRes.data)
      setIsFetching(false)
    }

    load().catch(() => {
      setAllMenus([])
      setIngredients([])
      setIsFetching(false)
    })
  }, [])

  useEffect(() => {
    setSelectedIds(defaultIngredientIds)
  }, [defaultIngredientIds])

  const selectedIngredientObjects = useMemo(
    () => ingredients.filter((ingredient) => selectedIds.includes(ingredient.id)),
    [ingredients, selectedIds],
  )

  const modifiers = useMemo(() => {
    const selectedSet = new Set(selectedIds)
    const defaultSet = new Set(defaultIngredientIds)

    return ingredients.flatMap((ingredient) => {
      if (selectedSet.has(ingredient.id) && !defaultSet.has(ingredient.id)) {
        return [{ ingredient_id: ingredient.id, name: ingredient.name, action: 'add', price: ingredient.price }]
      }

      if (!selectedSet.has(ingredient.id) && defaultSet.has(ingredient.id)) {
        return [{ ingredient_id: ingredient.id, name: ingredient.name, action: 'remove', price: 0 }]
      }

      return []
    })
  }, [defaultIngredientIds, ingredients, selectedIds])

  const totalPrice = useMemo(() => {
    const basePrice = selectedMenu?.price ?? 0
    const addPrice = modifiers.filter((item) => item.action === 'add').reduce((sum, item) => sum + item.price, 0)
    return (basePrice + addPrice) * qty
  }, [modifiers, qty, selectedMenu])

  const toggleIngredient = (ingredientId) => {
    setSelectedIds((prev) =>
      prev.includes(ingredientId) ? prev.filter((id) => id !== ingredientId) : [...prev, ingredientId],
    )
  }

  const handleAddToCart = () => {
    if (!selectedMenu) return

    addToCart({
      id: `custom-${selectedMenu.id}-${Date.now()}`,
      menu_id: selectedMenu.id,
      name: selectedMenu.name,
      basePrice: selectedMenu.price,
      price: totalPrice / qty,
      qty,
      modifiers,
      ingredients: selectedIngredientObjects.map((item) => item.name),
    })
    navigate('/cart')
  }

  if (isFetching) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-aldesCream px-4 py-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-aldesRed" />
          <p className="text-sm font-medium text-gray-600">Loading ingredients...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-aldesCream px-4 py-8 sm:px-6">
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-12">
        <article className="rounded-3xl bg-white p-6 shadow-md lg:col-span-7 lg:p-8">
          <p className="inline-flex rounded-full bg-aldesYellow/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-aldesRed">Universal Kitchen Modifiers</p>
          <h1 className="mt-3 text-2xl font-black text-gray-900">Build your premium burger</h1>

          <div className="mt-6 rounded-3xl border-2 border-dashed border-aldesRed/25 bg-aldesCream/50 p-5">
            <div className="space-y-3">
              {selectedIngredientObjects.map((ingredient) => (
                <div key={ingredient.id} className="rounded-2xl border border-red-100 bg-white px-4 py-3 text-center font-semibold text-gray-700 shadow-sm">
                  {ingredient.name}
                </div>
              ))}
            </div>
          </div>
        </article>

        <aside className="rounded-3xl bg-white p-6 shadow-md lg:col-span-5 lg:p-7">
          <h2 className="text-xl font-black text-gray-900">Ingredient controls</h2>

          <div className="mt-4 max-h-[460px] space-y-3 overflow-y-auto pr-1">
            {ingredients.map((ingredient) => {
              const isActive = selectedIds.includes(ingredient.id)
              return (
                <div key={ingredient.id} className="rounded-2xl border border-aldesRed/15 bg-aldesCream/40 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-900">{ingredient.name}</p>
                      <p className="mt-1 text-sm font-semibold text-aldesRed">Rp {ingredient.price.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => !isActive && toggleIngredient(ingredient.id)} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition enabled:hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-45" disabled={isActive}>ADD</button>
                      <button type="button" onClick={() => isActive && toggleIngredient(ingredient.id)} className="rounded-xl bg-aldesRed px-3 py-2 text-xs font-bold text-white transition enabled:hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45" disabled={!isActive}>REMOVE</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-aldesRed/15 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold text-gray-800">Quantity</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setQty((prev) => Math.max(1, prev - 1))} className="rounded-xl border border-aldesRed/25 bg-aldesRed/10 p-2 text-aldesRed"><Minus className="h-4 w-4" /></button>
                <span className="min-w-8 text-center text-lg font-bold text-gray-900">{qty}</span>
                <button type="button" onClick={() => setQty((prev) => prev + 1)} className="rounded-xl border border-aldesRed/25 bg-aldesRed/10 p-2 text-aldesRed"><Plus className="h-4 w-4" /></button>
              </div>
            </div>

            <button type="button" onClick={handleAddToCart} className="w-full rounded-2xl bg-aldesRed py-3 text-lg font-bold text-white transition hover:brightness-95">
              Add to Cart · Rp {totalPrice.toLocaleString('id-ID')}
            </button>
          </div>
        </aside>
      </section>
    </main>
  )
}

export default Kitchen

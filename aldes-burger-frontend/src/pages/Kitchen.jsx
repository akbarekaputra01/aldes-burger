import { Loader2, Minus, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ListItemSkeleton } from '../components/Skeletons'
import { useCart } from '../context/CartContext'
import api from '../lib/api'

function Kitchen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { addToCart } = useCart()

  const [allMenus, setAllMenus] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [ingredientCounts, setIngredientCounts] = useState({})
  const [qty, setQty] = useState(1)
  const [isFetching, setIsFetching] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [hasHandledFirstDuplicatePrompt, setHasHandledFirstDuplicatePrompt] = useState(false)

  const menuId = location.state?.menuId

  const selectedMenu = useMemo(
    () => allMenus.find((menu) => menu.id === menuId) ?? allMenus.find((menu) => menu.is_custom) ?? allMenus[0],
    [allMenus, menuId],
  )

  const defaultIngredientCounts = useMemo(
    () => Object.fromEntries((selectedMenu?.ingredients ?? []).map((item) => [item.id, item.pivot?.quantity ?? 1])),
    [selectedMenu],
  )

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
    }).finally(() => setIsFetching(false))
  }, [])

  useEffect(() => {
    setIngredientCounts(defaultIngredientCounts)
    setQty(1)
    setShowDuplicateModal(false)
    setHasHandledFirstDuplicatePrompt(false)
  }, [defaultIngredientCounts, menuId])

  const allowedIngredientIds = useMemo(() => {
    if (!selectedMenu) return []

    const relatedMenus = allMenus.filter((menu) => menu.category_id === selectedMenu.category_id)
    const ids = new Set(relatedMenus.flatMap((menu) => (menu.ingredients ?? []).map((ingredient) => ingredient.id)))

    if (ids.size === 0) {
      return ingredients.map((ingredient) => ingredient.id)
    }

    return [...ids]
  }, [allMenus, ingredients, selectedMenu])

  const visibleIngredients = useMemo(
    () => ingredients.filter((ingredient) => allowedIngredientIds.includes(ingredient.id)),
    [allowedIngredientIds, ingredients],
  )

  const selectedIngredientObjects = useMemo(
    () => visibleIngredients.filter((ingredient) => (ingredientCounts[ingredient.id] ?? 0) > 0),
    [visibleIngredients, ingredientCounts],
  )

  const modifiers = useMemo(() => {
    const defaultIds = new Set(Object.keys(defaultIngredientCounts).map(Number))

    return visibleIngredients.flatMap((ingredient) => {
      const currentCount = ingredientCounts[ingredient.id] ?? 0
      const baseCount = defaultIngredientCounts[ingredient.id] ?? 0

      if (currentCount === baseCount) return []

      if (!defaultIds.has(ingredient.id) && currentCount > 0) {
        return [{ ingredient_id: ingredient.id, name: ingredient.name, action: 'add', quantity: currentCount, price: ingredient.price * currentCount }]
      }

      if (defaultIds.has(ingredient.id) && currentCount === 0) {
        return [{ ingredient_id: ingredient.id, name: ingredient.name, action: 'remove', quantity: baseCount, price: 0 }]
      }

      if (currentCount > baseCount) {
        return [{
          ingredient_id: ingredient.id,
          name: ingredient.name,
          action: 'add',
          quantity: currentCount - baseCount,
          price: ingredient.price * (currentCount - baseCount),
        }]
      }

      return [{ ingredient_id: ingredient.id, name: ingredient.name, action: 'remove', quantity: baseCount - currentCount, price: 0 }]
    })
  }, [defaultIngredientCounts, ingredientCounts, visibleIngredients])

  const totalPrice = useMemo(() => {
    const basePrice = selectedMenu?.price ?? 0
    const addPrice = modifiers.filter((item) => item.action === 'add').reduce((sum, item) => sum + item.price, 0)
    return (basePrice + addPrice) * qty
  }, [modifiers, qty, selectedMenu])

  const handleIngredientCardClick = (ingredientId) => {
    setIngredientCounts((prev) => {
      const current = prev[ingredientId] ?? 0
      return { ...prev, [ingredientId]: current + 1 }
    })
  }

  const decrementIngredient = (ingredientId) => {
    setIngredientCounts((prev) => {
      const current = prev[ingredientId] ?? 0
      if (current <= 1) {
        const next = { ...prev }
        delete next[ingredientId]
        return next
      }
      return { ...prev, [ingredientId]: current - 1 }
    })
  }

  const incrementBurgerQty = () => {
    if (qty === 1 && !hasHandledFirstDuplicatePrompt) {
      setShowDuplicateModal(true)
      return
    }

    setQty((prev) => prev + 1)
  }

  const confirmDuplicateVersion = () => {
    setQty(2)
    setShowDuplicateModal(false)
    setHasHandledFirstDuplicatePrompt(true)
  }

  const cancelDuplicateVersion = () => {
    setShowDuplicateModal(false)
    setHasHandledFirstDuplicatePrompt(true)
  }

  const handleAddToCart = () => {
    if (!selectedMenu) return

    setIsLoading(true)

    addToCart({
      id: `custom-${selectedMenu.id}-${Date.now()}`,
      menu_id: selectedMenu.id,
      name: selectedMenu.name,
      basePrice: selectedMenu.price,
      price: totalPrice / qty,
      qty,
      modifiers,
      ingredients: selectedIngredientObjects.map((item) => {
        const count = ingredientCounts[item.id] ?? 0
        return count > 1 ? `${item.name} x${count}` : item.name
      }),
    })

    navigate('/cart')
    setTimeout(() => setIsLoading(false), 250)
  }

  return (
    <main className="min-h-screen bg-aldesCream px-4 py-8 sm:px-6">
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-black text-aldesRed">Confirm Burger Quantity</h2>
            <p className="mt-3 text-sm text-gray-700">Are you sure you want to create the same version?</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={cancelDuplicateVersion} className="rounded-2xl border border-gray-200 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50">No</button>
              <button type="button" onClick={confirmDuplicateVersion} className="rounded-2xl bg-aldesRed px-4 py-2 font-semibold text-white transition hover:brightness-110">Yes</button>
            </div>
          </div>
        </div>
      )}

      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-12">
        <article className="rounded-3xl bg-white p-6 shadow-md lg:col-span-7 lg:p-8">
          <p className="inline-flex rounded-full bg-aldesYellow px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black">Kitchen Preset</p>
          <h1 className="mt-3 text-2xl font-black text-gray-900">{selectedMenu?.name ?? 'Build your burger'}</h1>

          <div className="mt-6 rounded-3xl border border-aldesCream bg-aldesCream/40 p-5">
            <div className="space-y-3">
              {selectedIngredientObjects.length === 0 ? (
                <p className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-gray-500 shadow-sm">
                  No ingredients selected yet.
                </p>
              ) : selectedIngredientObjects.map((ingredient) => (
                <div key={ingredient.id} className="rounded-2xl border border-aldesCream bg-white px-4 py-3 text-center font-semibold text-gray-700 shadow-sm">
                  {ingredient.name} {ingredientCounts[ingredient.id] > 1 ? `x${ingredientCounts[ingredient.id]}` : ''}
                </div>
              ))}
            </div>
          </div>
        </article>

        <aside className="rounded-3xl bg-white p-6 shadow-md lg:col-span-5 lg:p-7">
          <h2 className="text-xl font-black text-aldesRed">Ingredients</h2>

          <div className="mt-4 grid max-h-[460px] grid-cols-1 gap-3 overflow-y-auto pr-1">
            {isFetching
              ? Array.from({ length: 6 }).map((_, idx) => <ListItemSkeleton key={idx} />)
              : visibleIngredients.map((ingredient) => {
                const ingredientQty = ingredientCounts[ingredient.id] ?? 0
                const isActive = ingredientQty > 0

                return (
                  <button
                    key={ingredient.id}
                    type="button"
                    onClick={() => handleIngredientCardClick(ingredient.id)}
                    className={`rounded-3xl border p-4 text-left transition ${
                      isActive
                        ? 'border-aldesRed bg-aldesYellow/60'
                        : 'border-aldesCream bg-white hover:border-aldesYellow hover:bg-aldesCream/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-gray-900">{ingredient.name}</p>
                        <p className="mt-1 text-sm font-semibold text-aldesRed">Rp {ingredient.price.toLocaleString('id-ID')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <span className="rounded-2xl bg-white px-2.5 py-1 text-xs font-black text-aldesRed shadow-sm">
                            x{ingredientQty}
                          </span>
                        ) : null}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            decrementIngredient(ingredient.id)
                          }}
                          disabled={!isActive}
                          className="rounded-xl border border-aldesRed/20 bg-white p-1.5 text-aldesRed transition enabled:hover:bg-aldesCream disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label={`Decrease ${ingredient.name}`}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </button>
                )
              })}
          </div>

          <div className="mt-6 rounded-2xl border border-aldesCream bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold text-gray-800">Burger Quantity</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setQty((prev) => Math.max(1, prev - 1))} className="rounded-xl border border-aldesCream bg-aldesCream/40 p-2 text-aldesRed"><Minus className="h-4 w-4" /></button>
                <span className="min-w-8 text-center text-lg font-bold text-gray-900">{qty}</span>
                <button type="button" onClick={incrementBurgerQty} className="rounded-xl border border-aldesCream bg-aldesCream/40 p-2 text-aldesRed"><Plus className="h-4 w-4" /></button>
              </div>
            </div>

            <button type="button" disabled={isLoading} onClick={handleAddToCart} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-aldesRed py-3 text-lg font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Add to Cart · Rp {totalPrice.toLocaleString('id-ID')}
            </button>
          </div>
        </aside>
      </section>
    </main>
  )
}

export default Kitchen

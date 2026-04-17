import { GripVertical, Loader2, Minus, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ListItemSkeleton } from '../components/Skeletons'
import { useCart } from '../context/CartContext'
import api from '../lib/api'

const bunTop = { uid: 'bun-top', ingredientId: null, name: 'Top Bun', type: 'bun', price: 0 }
const bunBottom = { uid: 'bun-bottom', ingredientId: null, name: 'Bottom Bun', type: 'bun', price: 0 }

const makeUid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const ingredientStyle = {
  bun: 'bg-aldesYellow/60 border-aldesYellow text-black',
  ingredient: 'bg-white border-aldesCream text-gray-800',
}

function Kitchen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { addToCart } = useCart()

  const [allMenus, setAllMenus] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [burgerStack, setBurgerStack] = useState([bunTop, bunBottom])
  const [draggingPantryIngredientId, setDraggingPantryIngredientId] = useState(null)
  const [draggingStackLayerUid, setDraggingStackLayerUid] = useState(null)
  const [dropIndex, setDropIndex] = useState(null)
  const [qty, setQty] = useState(1)
  const [isFetching, setIsFetching] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const menuId = location.state?.menuId

  const selectedMenu = useMemo(
    () => allMenus.find((menu) => menu.id === menuId) ?? allMenus.find((menu) => menu.is_custom) ?? allMenus[0],
    [allMenus, menuId],
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

  const ingredientById = useMemo(() => Object.fromEntries(visibleIngredients.map((item) => [item.id, item])), [visibleIngredients])

  useEffect(() => {
    if (!selectedMenu) return

    const defaultLayers = []
    ;(selectedMenu.ingredients ?? []).forEach((ingredient) => {
      const quantity = ingredient.pivot?.quantity ?? 1
      for (let index = 0; index < quantity; index += 1) {
        defaultLayers.push({
          uid: makeUid(),
          ingredientId: ingredient.id,
          name: ingredient.name,
          type: 'ingredient',
          price: ingredient.price ?? 0,
        })
      }
    })

    setBurgerStack([{ ...bunTop }, ...defaultLayers, { ...bunBottom }])
    setQty(1)
  }, [selectedMenu?.id])

  const layerCounts = useMemo(() => {
    const map = {}
    burgerStack.forEach((layer) => {
      if (!layer.ingredientId) return
      map[layer.ingredientId] = (map[layer.ingredientId] ?? 0) + 1
    })
    return map
  }, [burgerStack])

  const defaultCounts = useMemo(() => {
    const map = {}
    ;(selectedMenu?.ingredients ?? []).forEach((ingredient) => {
      map[ingredient.id] = ingredient.pivot?.quantity ?? 1
    })
    return map
  }, [selectedMenu])

  const modifiers = useMemo(() => {
    const ids = new Set([...Object.keys(defaultCounts), ...Object.keys(layerCounts)].map(Number))

    return [...ids].flatMap((id) => {
      const currentCount = layerCounts[id] ?? 0
      const baseCount = defaultCounts[id] ?? 0
      const ingredient = ingredientById[id] ?? (selectedMenu?.ingredients ?? []).find((item) => item.id === id)
      if (!ingredient || currentCount === baseCount) return []

      if (currentCount > baseCount) {
        return [{
          ingredient_id: id,
          name: ingredient.name,
          action: 'add',
          quantity: currentCount - baseCount,
          price: (ingredient.price ?? 0) * (currentCount - baseCount),
        }]
      }

      return [{
        ingredient_id: id,
        name: ingredient.name,
        action: 'remove',
        quantity: baseCount - currentCount,
        price: 0,
      }]
    })
  }, [defaultCounts, ingredientById, layerCounts, selectedMenu])

  const totalPrice = useMemo(() => {
    const basePrice = selectedMenu?.price ?? 0
    const addPrice = modifiers.filter((item) => item.action === 'add').reduce((sum, item) => sum + item.price, 0)
    return (basePrice + addPrice) * qty
  }, [modifiers, qty, selectedMenu])

  const insertAtIndex = (nextLayer, index) => {
    setBurgerStack((prev) => {
      const safeIndex = Math.max(0, Math.min(index, prev.length))
      const copy = [...prev]
      copy.splice(safeIndex, 0, nextLayer)
      return copy
    })
  }

  const handleDropOnStack = (index) => {
    if (draggingPantryIngredientId) {
      const ingredient = visibleIngredients.find((item) => String(item.id) === draggingPantryIngredientId)
      if (ingredient) {
        insertAtIndex({ uid: makeUid(), ingredientId: ingredient.id, name: ingredient.name, type: 'ingredient', price: ingredient.price ?? 0 }, index)
      }
    }

    if (draggingStackLayerUid) {
      setBurgerStack((prev) => {
        const sourceIndex = prev.findIndex((layer) => layer.uid === draggingStackLayerUid)
        if (sourceIndex < 0) return prev
        const copy = [...prev]
        const [moved] = copy.splice(sourceIndex, 1)
        const targetIndex = sourceIndex < index ? index - 1 : index
        copy.splice(targetIndex, 0, moved)
        return copy
      })
    }

    setDraggingPantryIngredientId(null)
    setDraggingStackLayerUid(null)
    setDropIndex(null)
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
      ingredients: burgerStack.map((layer) => layer.name),
    })

    navigate('/cart')
    setTimeout(() => setIsLoading(false), 250)
  }

  return (
    <main className="min-h-screen bg-aldesCream px-4 py-8 sm:px-6">
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-12">
        <article className="rounded-3xl bg-white p-6 shadow-md lg:col-span-7 lg:p-8">
          <p className="inline-flex rounded-full bg-aldesYellow px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black">Gamified Kitchen</p>
          <h1 className="mt-3 text-2xl font-black text-gray-900">{selectedMenu?.name ?? 'Build your burger'}</h1>
          <p className="mt-2 text-sm text-gray-600">Drag ingredients from pantry and drop anywhere in your stack.</p>

          <div className="mt-6 rounded-3xl border border-aldesCream bg-aldesCream/40 p-5">
            <h2 className="mb-3 text-lg font-black text-aldesRed">Burger Stack</h2>
            <div
              className="space-y-2 rounded-2xl border border-dashed border-aldesCream bg-white p-3"
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDropOnStack(burgerStack.length)}
            >
              {burgerStack.map((layer, index) => (
                <div key={layer.uid}>
                  <div
                    className={`h-2 rounded-full transition ${dropIndex === index ? 'bg-aldesYellow' : 'bg-transparent'}`}
                    onDragOver={(event) => {
                      event.preventDefault()
                      setDropIndex(index)
                    }}
                    onDrop={() => handleDropOnStack(index)}
                  />

                  <div
                    draggable
                    onDragStart={() => setDraggingStackLayerUid(layer.uid)}
                    onDragEnd={() => {
                      setDraggingStackLayerUid(null)
                      setDropIndex(null)
                    }}
                    className={`flex cursor-grab items-center justify-between rounded-2xl border px-3 py-2 ${ingredientStyle[layer.type]}`}
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-aldesRed" />
                      <p className="font-semibold">{layer.name}</p>
                    </div>
                    {layer.ingredientId ? (
                      <button
                        type="button"
                        onClick={() => setBurgerStack((prev) => prev.filter((item) => item.uid !== layer.uid))}
                        className="cursor-pointer rounded-xl border border-aldesRed/25 bg-white/80 p-1.5 text-aldesRed transition hover:bg-aldesCream"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-aldesRed">Pantry</h2>
            <div className="mt-4 grid max-h-[360px] grid-cols-1 gap-3 overflow-y-auto pr-1">
              {isFetching
                ? Array.from({ length: 6 }).map((_, idx) => <ListItemSkeleton key={idx} />)
                : visibleIngredients.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    draggable
                    onDragStart={() => setDraggingPantryIngredientId(String(ingredient.id))}
                    onDragEnd={() => setDraggingPantryIngredientId(null)}
                    className="cursor-grab rounded-3xl border border-aldesCream bg-white p-4 text-left transition hover:border-aldesYellow hover:bg-aldesCream/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-gray-900">{ingredient.name}</p>
                        <p className="mt-1 text-sm font-semibold text-aldesRed">Rp {ingredient.price.toLocaleString('id-ID')}</p>
                      </div>
                      <span className="rounded-2xl bg-aldesYellow/40 px-2.5 py-1 text-xs font-black text-aldesRed">
                        x{layerCounts[ingredient.id] ?? 0}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </aside>
        </article>

        <aside className="rounded-3xl bg-white p-6 shadow-md lg:col-span-5 lg:p-7">
          <h2 className="text-xl font-black text-aldesRed">Order Config</h2>

          <div className="mt-4 space-y-2 rounded-2xl bg-aldesCream p-4 text-sm">
            {modifiers.length === 0 ? <p className="font-medium text-gray-700">No modifier changes yet.</p> : modifiers.map((modifier) => (
              <p key={`${modifier.action}-${modifier.ingredient_id}`} className="text-gray-800">{modifier.action.toUpperCase()} {modifier.name} x{modifier.quantity}</p>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-aldesCream bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold text-gray-800">Burger Quantity</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setQty((prev) => Math.max(1, prev - 1))} className="cursor-pointer rounded-xl border border-aldesCream bg-aldesCream/40 p-2 text-aldesRed"><Minus className="h-4 w-4" /></button>
                <span className="min-w-8 text-center text-lg font-bold text-gray-900">{qty}</span>
                <button type="button" onClick={() => setQty((prev) => prev + 1)} className="cursor-pointer rounded-xl border border-aldesCream bg-aldesCream/40 p-2 text-aldesRed"><Plus className="h-4 w-4" /></button>
              </div>
            </div>

            <button type="button" disabled={isLoading} onClick={handleAddToCart} className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-2xl bg-aldesRed py-3 text-lg font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70">
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

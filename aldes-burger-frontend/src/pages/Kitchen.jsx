import { GripVertical, Loader2, Minus, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ListItemSkeleton } from '../components/Skeletons'
import { useCart } from '../context/CartContext'
import api from '../lib/api'

const makeUid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

const toIngredientInstances = (menuIngredients = []) => menuIngredients.flatMap((ingredient) => {
  const quantity = ingredient.pivot?.quantity ?? 1
  return Array.from({ length: quantity }).map((_, index) => ({
    instance_id: makeUid(),
    ingredient_id: ingredient.id,
    ingredient_name: ingredient.name,
    ingredient_price: ingredient.price ?? 0,
    source: 'default',
    baseline_ref: `${ingredient.id}-${index + 1}`,
  }))
})

function Kitchen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { addToCart } = useCart()

  const [menu, setMenu] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [burgerStack, setBurgerStack] = useState([])
  const [baselineStack, setBaselineStack] = useState([])
  const [qty, setQty] = useState(1)
  const [showQtyConfirm, setShowQtyConfirm] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [draggingData, setDraggingData] = useState(null)
  const [dropIndex, setDropIndex] = useState(null)

  const menuId = location.state?.menuId
  const incomingMenu = location.state?.menu

  const selectedMenu = useMemo(() => {
    if (!menu.length) return null
    if (incomingMenu?.id) {
      return menu.find((menu) => menu.id === incomingMenu.id) ?? incomingMenu
    }

    return menu.find((menu) => menu.id === menuId) ?? menu.find((menu) => menu.is_custom) ?? menu[0]
  }, [incomingMenu, menuId, menu])

  useEffect(() => {
    const loadData = async () => {
      setIsFetching(true)
      const [menuRes, ingredientsRes] = await Promise.all([api.get('/menus'), api.get('/ingredients')])
      setMenu(menuRes.data)
      setIngredients(ingredientsRes.data)
      setIsFetching(false)
    }

    loadData()
      .catch(() => {
        setMenu([])
        setIngredients([])
      })
      .finally(() => setIsFetching(false))
  }, [])

  useEffect(() => {
    if (!selectedMenu) return

    if (selectedMenu.is_custom) {
      setBaselineStack([])
      setBurgerStack([])
      setQty(1)
      return
    }

    const initialStack = toIngredientInstances(selectedMenu.ingredients ?? [])
    setBaselineStack(initialStack)
    setBurgerStack(initialStack)
    setQty(1)
  }, [selectedMenu])

  const allowedIngredientIds = useMemo(() => {
    if (!selectedMenu) return []

    if (selectedMenu.is_custom) {
      return ingredients.map((ingredient) => ingredient.id)
    }

    return (selectedMenu.ingredients ?? []).map((ingredient) => ingredient.id)
  }, [ingredients, selectedMenu])

  const pantryIngredients = useMemo(
    () => ingredients.filter((ingredient) => allowedIngredientIds.includes(ingredient.id)),
    [allowedIngredientIds, ingredients],
  )

  const layerCounts = useMemo(() => {
    const counts = {}
    burgerStack.forEach((layer) => {
      counts[layer.ingredient_id] = (counts[layer.ingredient_id] ?? 0) + 1
    })
    return counts
  }, [burgerStack])

  const baseCounts = useMemo(() => {
    const counts = {}
    baselineStack.forEach((layer) => {
      counts[layer.ingredient_id] = (counts[layer.ingredient_id] ?? 0) + 1
    })
    return counts
  }, [baselineStack])

  const modifiers = useMemo(() => {
    const keys = new Set([...Object.keys(baseCounts), ...Object.keys(layerCounts)].map(Number))

    return [...keys].flatMap((ingredientId) => {
      const baseQty = baseCounts[ingredientId] ?? 0
      const currentQty = layerCounts[ingredientId] ?? 0
      if (baseQty === currentQty) return []

      if (currentQty > baseQty) {
        return [{ ingredient_id: ingredientId, action: 'add', quantity: currentQty - baseQty }]
      }

      return [{ ingredient_id: ingredientId, action: 'remove', quantity: baseQty - currentQty }]
    })
  }, [baseCounts, layerCounts])

  const baselineOrder = useMemo(
    () => baselineStack.filter((layer) => layer.source === 'default').map((layer) => layer.baseline_ref),
    [baselineStack],
  )

  const currentDefaultOrder = useMemo(
    () => burgerStack.filter((layer) => layer.source === 'default').map((layer) => layer.baseline_ref),
    [burgerStack],
  )

  const orderChanged = useMemo(
    () => baselineOrder.length === currentDefaultOrder.length && baselineOrder.join('|') !== currentDefaultOrder.join('|'),
    [baselineOrder, currentDefaultOrder],
  )

  const stackOrderPayload = useMemo(
    () => burgerStack.map((layer, index) => ({
      position: index + 1,
      ingredient_id: layer.ingredient_id,
      ingredient_name: layer.ingredient_name,
    })),
    [burgerStack],
  )

  const additionalIngredientTotal = useMemo(
    () => burgerStack
      .filter((layer) => layer.source === 'added' || selectedMenu?.is_custom)
      .reduce((sum, layer) => sum + (layer.ingredient_price ?? 0), 0),
    [burgerStack, selectedMenu?.is_custom],
  )

  const unitPrice = useMemo(() => {
    const basePrice = selectedMenu?.is_custom ? 0 : (selectedMenu?.price ?? 0)
    return basePrice + additionalIngredientTotal
  }, [additionalIngredientTotal, selectedMenu])

  const totalPrice = unitPrice * qty

  const addIngredientToStack = (ingredient, atIndex = burgerStack.length) => {
    const newLayer = {
      instance_id: makeUid(),
      ingredient_id: ingredient.id,
      ingredient_name: ingredient.name,
      ingredient_price: ingredient.price ?? 0,
      source: 'added',
      baseline_ref: null,
    }

    setBurgerStack((prev) => {
      const safeIndex = Math.max(0, Math.min(atIndex, prev.length))
      const next = [...prev]
      next.splice(safeIndex, 0, newLayer)
      return next
    })
  }

  const removeLayer = (instanceId) => {
    setBurgerStack((prev) => prev.filter((layer) => layer.instance_id !== instanceId))
  }

  const moveLayer = (sourceInstanceId, targetIndex) => {
    setBurgerStack((prev) => {
      const sourceIndex = prev.findIndex((layer) => layer.instance_id === sourceInstanceId)
      if (sourceIndex < 0) return prev

      const next = [...prev]
      const [moved] = next.splice(sourceIndex, 1)
      const normalizedTarget = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex
      const safeIndex = Math.max(0, Math.min(normalizedTarget, next.length))
      next.splice(safeIndex, 0, moved)
      return next
    })
  }

  const handleDropAtIndex = (index) => {
    if (!draggingData) return

    if (draggingData.type === 'pantry') {
      addIngredientToStack(draggingData.ingredient, index)
    }

    if (draggingData.type === 'stack') {
      moveLayer(draggingData.instance_id, index)
    }

    setDraggingData(null)
    setDropIndex(null)
  }

  const handleQtyIncrease = () => {
    if (qty === 1) {
      setShowQtyConfirm(true)
      return
    }

    setQty((prev) => prev + 1)
  }

  const handleQtyConfirm = (confirmed) => {
    setShowQtyConfirm(false)
    if (confirmed) {
      setQty(2)
    }
  }

  const handleAddToCart = () => {
    if (!selectedMenu) return

    const payload = {
      menu_id: selectedMenu.id,
      name: selectedMenu.name,
      qty,
      base_price: selectedMenu.is_custom ? 0 : (selectedMenu.price ?? 0),
      unit_price: unitPrice,
      total_price: totalPrice,
      modifiers,
      stack_order: stackOrderPayload,
      ingredients: burgerStack.map((layer) => layer.ingredient_name),
      reorder_only: orderChanged && modifiers.length === 0,
      is_customized: selectedMenu.is_custom || modifiers.length > 0 || orderChanged,
    }

    setIsAddingToCart(true)
    addToCart(payload)
    navigate('/cart')
    setTimeout(() => setIsAddingToCart(false), 200)
  }

  const canAddToCart = selectedMenu?.is_custom ? burgerStack.length > 0 : true

  return (
    <main className="min-h-screen bg-aldesCream px-4 py-8 sm:px-6">
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-12">
        <article className="rounded-3xl bg-white p-6 shadow-md lg:col-span-7 lg:p-8">
          <p className="inline-flex rounded-full bg-aldesYellow px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black">Gamified Kitchen</p>
          <h1 className="mt-3 text-2xl font-black text-aldesRed">{selectedMenu?.name ?? 'Build your burger'}</h1>
          <p className="mt-2 text-sm text-aldesRed/80">Drag ingredients from pantry and arrange your exact stack order.</p>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-aldesCream bg-aldesCream/40 p-5">
              <h2 className="mb-3 text-lg font-black text-aldesRed">Burger Stack</h2>
              <div className="space-y-2 rounded-2xl border border-dashed border-aldesCream bg-white p-3">
                <div
                  className={`h-2 rounded-full ${dropIndex === 0 ? 'bg-aldesYellow' : 'bg-transparent'}`}
                  onDragOver={(event) => {
                    event.preventDefault()
                    setDropIndex(0)
                  }}
                  onDrop={() => handleDropAtIndex(0)}
                />

                {burgerStack.length === 0 ? (
                  <div
                    className="rounded-2xl border border-aldesCream bg-aldesCream p-3"
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleDropAtIndex(0)}
                  >
                    <p className="text-sm font-semibold text-aldesRed/70">Drop ingredients here to start building.</p>
                  </div>
                ) : (
                  burgerStack.map((layer, index) => (
                    <div key={layer.instance_id}>
                      <div
                        draggable
                        onDragStart={() => setDraggingData({ type: 'stack', instance_id: layer.instance_id })}
                        onDragEnd={() => {
                          setDraggingData(null)
                          setDropIndex(null)
                        }}
                        className="flex cursor-pointer items-center justify-between rounded-2xl border border-aldesCream bg-white px-3 py-2 text-aldesRed"
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4" />
                          <p className="font-semibold">{layer.ingredient_name}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLayer(layer.instance_id)}
                          className="cursor-pointer rounded-xl border border-aldesRed/40 bg-aldesCream p-1.5 text-aldesRed"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div
                        className={`h-2 rounded-full ${dropIndex === index + 1 ? 'bg-aldesYellow' : 'bg-transparent'}`}
                        onDragOver={(event) => {
                          event.preventDefault()
                          setDropIndex(index + 1)
                        }}
                        onDrop={() => handleDropAtIndex(index + 1)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>

            <aside className="rounded-3xl bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-aldesRed">Pantry</h2>
              <div className="mt-4 grid max-h-[420px] grid-cols-1 gap-3 overflow-y-auto pr-1">
                {isFetching
                  ? Array.from({ length: 6 }).map((_, idx) => <ListItemSkeleton key={idx} />)
                  : pantryIngredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      draggable
                      onDragStart={() => setDraggingData({ type: 'pantry', ingredient })}
                      onDragEnd={() => setDraggingData(null)}
                      className="cursor-pointer rounded-3xl border border-aldesCream bg-white p-4 transition hover:border-aldesYellow hover:bg-aldesCream/50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-aldesRed">{ingredient.name}</p>
                          <p className="mt-1 text-sm font-semibold text-aldesRed">Rp {(ingredient.price ?? 0).toLocaleString('id-ID')}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addIngredientToStack(ingredient)}
                          className="cursor-pointer rounded-xl bg-aldesRed px-3 py-1.5 text-xs font-bold text-white"
                        >
                          Add
                        </button>
                      </div>

                      <p className="mt-3 text-right text-sm font-semibold text-aldesRed/70">In stack: x{layerCounts[ingredient.id] ?? 0}</p>
                    </div>
                  ))}
              </div>
            </aside>
          </div>
        </article>

        <aside className="rounded-3xl bg-white p-6 shadow-md lg:col-span-5 lg:p-7">
          <h2 className="text-xl font-black text-aldesRed">Order Config</h2>

          <div className="mt-4 space-y-2 rounded-2xl bg-aldesCream p-4 text-sm">
            {modifiers.length === 0 ? (
              <p className="font-medium text-aldesRed/80">No add/remove modifiers yet.</p>
            ) : (
              modifiers.map((modifier) => (
                <p key={`${modifier.action}-${modifier.ingredient_id}`} className="text-aldesRed">
                  {modifier.action.toUpperCase()} ingredient #{modifier.ingredient_id} x{modifier.quantity}
                </p>
              ))
            )}
            {orderChanged ? <p className="font-semibold text-aldesRed">REORDER: stack layer order changed.</p> : null}
          </div>

          <div className="mt-6 rounded-2xl border border-aldesCream bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold text-aldesRed">Burger Quantity</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setQty((prev) => Math.max(1, prev - 1))} className="cursor-pointer rounded-xl border border-aldesCream bg-aldesCream/40 p-2 text-aldesRed"><Minus className="h-4 w-4" /></button>
                <span className="min-w-8 text-center text-lg font-bold text-aldesRed">{qty}</span>
                <button type="button" onClick={handleQtyIncrease} className="cursor-pointer rounded-xl border border-aldesCream bg-aldesCream/40 p-2 text-aldesRed"><Plus className="h-4 w-4" /></button>
              </div>
            </div>

            <button type="button" disabled={isAddingToCart || !canAddToCart} onClick={handleAddToCart} className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-2xl bg-aldesRed py-3 text-lg font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70">
              {isAddingToCart ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Add to Cart · Rp {totalPrice.toLocaleString('id-ID')}
            </button>
          </div>
        </aside>
      </section>

      {showQtyConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-aldesRed/30 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-black text-aldesRed">Duplicate this exact burger?</h3>
            <p className="mt-2 text-sm text-aldesRed/80">
              Are you sure you want to create the exact same version for the next burger?
            </p>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => handleQtyConfirm(true)} className="cursor-pointer flex-1 rounded-2xl bg-aldesRed px-4 py-2.5 font-semibold text-white">
                Yes
              </button>
              <button type="button" onClick={() => handleQtyConfirm(false)} className="cursor-pointer flex-1 rounded-2xl border border-aldesCream bg-aldesCream px-4 py-2.5 font-semibold text-aldesRed">
                No
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default Kitchen

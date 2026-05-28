import { AlertTriangle, Minus, Pencil, Plus, PlusCircle, Trash2, Utensils, X, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../lib/api'

// --- helpers ---
function StockBadge({ stock }) {
  if (stock === null || stock === undefined) return null
  const low = stock <= 5
  const mid = stock <= 20

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
        low
          ? 'bg-red-100 text-red-700'
          : mid
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-emerald-100 text-emerald-700'
      }`}
    >
      {low && <AlertTriangle className="h-3 w-3" />}
      Stock: {stock}
    </span>
  )
}

// --- component ---
function AdminMenuManagement() {
  const [menu, setMenu] = useState([])
  const [allIngredients, setAllIngredients] = useState([])
  const [isLoading, setIsLoading] = useState(true) // STATE BARU: Untuk loading animation

  // Edit price modal
  const [selectedMenu, setSelectedMenu] = useState(null)
  const [newPrice, setNewPrice] = useState('')

  // Recipe modal
  const [recipeMenu, setRecipeMenu] = useState(null)
  const [recipeIngredients, setRecipeIngredients] = useState([]) // [{id, name, quantity, stock}]
  const [selectedIngredientId, setSelectedIngredientId] = useState('')
  const [addQuantity, setAddQuantity] = useState(1)

  // Delete ingredient confirmation
  const [deleteIngredientTarget, setDeleteIngredientTarget] = useState(null)

  // --- data loading ---
  const loadMenu = () =>
    api
      .get('/admin/menus')
      .then(({ data }) => setMenu(data))
      .catch(() => setMenu([]))

  const loadIngredients = () =>
    api
      .get('/ingredients')
      .then(({ data }) => setAllIngredients(data))
      .catch(() => {})

  useEffect(() => {
    setIsLoading(true)
    Promise.all([loadMenu(), loadIngredients()]).finally(() => {
      setIsLoading(false)
    })
  }, [])

  // --- edit price ---
  const openEditPriceModal = (menu) => {
    setSelectedMenu(menu)
    setNewPrice(menu.price)
  }

  const closeEditPriceModal = () => {
    setSelectedMenu(null)
    setNewPrice('')
  }

  const submitEditPrice = async (e) => {
    e.preventDefault()
    const nextPrice = Number(newPrice)
    if (Number.isNaN(nextPrice)) return

    await api.put(`/admin/menus/${selectedMenu.id}`, { price: nextPrice })
    closeEditPriceModal()
    loadMenu()
  }

  // --- recipe modal ---
  const openRecipeModal = (menu) => {
    setRecipeMenu(menu)
    // Normalise: pivot.quantity may come from API as ingredient.pivot.quantity
    const normalised = (menu.ingredients ?? []).map((ing) => ({
      id: ing.id,
      name: ing.name,
      stock: ing.stock,
      quantity: ing.pivot?.quantity ?? ing.quantity ?? 1,
    }))
    setRecipeIngredients(normalised)
    setSelectedIngredientId('')
    setAddQuantity(1)
  }

  const closeRecipeModal = () => {
    setRecipeMenu(null)
    setRecipeIngredients([])
    setSelectedIngredientId('')
    setAddQuantity(1)
    setDeleteIngredientTarget(null)
  }

  const addIngredientToRecipe = () => {
    if (!selectedIngredientId) return

    const ingredient = allIngredients.find(
      (item) => String(item.id) === String(selectedIngredientId),
    )
    if (!ingredient) return

    if (recipeIngredients.some((item) => item.id === ingredient.id)) return

    setRecipeIngredients([
      ...recipeIngredients,
      { id: ingredient.id, name: ingredient.name, stock: ingredient.stock, quantity: addQuantity },
    ])
    setSelectedIngredientId('')
    setAddQuantity(1)
  }

  const changeQuantity = (id, delta) => {
    setRecipeIngredients((prev) =>
      prev.map((ing) =>
        ing.id === id ? { ...ing, quantity: Math.max(1, ing.quantity + delta) } : ing,
      ),
    )
  }

  const openDeleteIngredientPopup = (ingredient) => setDeleteIngredientTarget(ingredient)
  const closeDeleteIngredientPopup = () => setDeleteIngredientTarget(null)

  const confirmDeleteIngredient = () => {
    if (!deleteIngredientTarget) return
    setRecipeIngredients(
      recipeIngredients.filter((ing) => ing.id !== deleteIngredientTarget.id),
    )
    closeDeleteIngredientPopup()
  }

  const submitRecipe = async (e) => {
    e.preventDefault()
    await api.put(`/admin/menus/${recipeMenu.id}`, {
      ingredients: recipeIngredients.map((ing) => ({ id: ing.id, quantity: ing.quantity })),
    })
    closeRecipeModal()
    loadMenu()
  }

  const availableIngredients = allIngredients.filter(
    (ing) => !recipeIngredients.some((r) => r.id === ing.id),
  )

  // --- render ---

  // Tampilkan loading animation saat pertama kali dimuat
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-aldesCream">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-red-600" />
          <p className="text-sm font-bold text-gray-500">Memuat Menu Management...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-aldesCream px-4 py-8 sm:px-6">
      <section className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 rounded-3xl border border-orange-100 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                <Utensils className="h-4 w-4" />
                Aldes Burger Admin
              </div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
                Menu Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage menu prices and preset recipes. Stock is computed live from ingredient inventory.
              </p>
            </div>
            <div className="rounded-2xl bg-aldesCream px-4 py-3 text-center">
              <p className="text-xs font-medium text-gray-500">Total Menu</p>
              <p className="text-2xl font-black text-red-600">{menu.length}</p>
            </div>
          </div>
        </div>

        {/* Menu List */}
        <div className="space-y-4">
          {menu.map((item) => (
            <article
              key={item.id}
              className="group rounded-3xl border border-orange-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <Utensils className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{item.name}</h2>
                    <p className="mt-0.5 text-sm text-gray-500">{item.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {item.price > 0 && (
                        <span className="rounded-full bg-yellow-50 px-3 py-1 text-sm font-bold text-gray-800">
                          Rp {Number(item.price).toLocaleString('id-ID')}
                        </span>
                      )}
                      {/* computed_stock from backend */}
                      <StockBadge stock={item.computed_stock} />
                      {item.is_custom && (
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                          DIY / Custom
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditPriceModal(item)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Price
                  </button>
                  <button
                    type="button"
                    onClick={() => openRecipeModal(item)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Manage Recipe
                  </button>
                </div>
              </div>

              {/* Ingredients row */}
              <div className="mt-5 border-t border-gray-100 pt-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
                  Ingredients
                </p>
                {item.ingredients?.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {item.ingredients.map((ing) => (
                      <li
                        key={`${item.id}-${ing.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1.5 text-sm font-medium text-gray-800"
                      >
                        <span>{ing.name}</span>
                        {(ing.pivot?.quantity ?? ing.quantity ?? 1) > 1 && (
                          <span className="rounded-full bg-yellow-200 px-1.5 py-0.5 text-xs font-bold text-yellow-800">
                            x{ing.pivot?.quantity ?? ing.quantity}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">No ingredients added yet.</p>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {menu.length === 0 && (
          <div className="rounded-3xl border border-dashed border-orange-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Utensils className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">No menu available</h2>
            <p className="mt-1 text-sm text-gray-500">Menu data will appear here after it is loaded.</p>
          </div>
        )}
      </section>

      {/* --- Edit Price Modal --- */}
      {selectedMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                  <Pencil className="h-4 w-4" />
                  Edit Menu Price
                </div>
                <h2 className="text-xl font-black text-gray-900">{selectedMenu.name}</h2>
                <p className="mt-1 text-sm text-gray-500">Update the menu price below.</p>
              </div>
              <button
                type="button"
                onClick={closeEditPriceModal}
                className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitEditPrice}>
              <div className="mb-5">
                <label htmlFor="price" className="mb-2 block text-sm font-bold text-gray-700">
                  New Price
                </label>
                <div className="flex overflow-hidden rounded-2xl border border-gray-200 bg-white focus-within:border-red-300 focus-within:ring-4 focus-within:ring-red-50">
                  <span className="flex items-center border-r border-gray-200 bg-gray-50 px-4 text-sm font-bold text-gray-500">
                    Rp
                  </span>
                  <input
                    id="price"
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-4 py-3 text-sm font-semibold text-gray-900 outline-none"
                    placeholder="Enter new price"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditPriceModal}
                  className="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
                >
                  Save Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Manage Recipe Modal --- */}
      {recipeMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          {/* PERBAIKAN: Menambahkan max-h-[90vh] dan overflow-y-auto pada kontainer utama modal */}
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                  <Utensils className="h-4 w-4" />
                  Manage Recipe
                </div>
                <h2 className="text-xl font-black text-gray-900">{recipeMenu.name}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Add or remove ingredients and set their quantity per portion.
                </p>
              </div>
              <button
                type="button"
                onClick={closeRecipeModal}
                className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitRecipe}>
              {/* Current ingredients */}
              <div className="mb-5">
                <p className="mb-3 text-sm font-bold text-gray-700">Current Ingredients</p>
                {recipeIngredients.length > 0 ? (
                  /* PERBAIKAN: Membatasi tinggi daftar bahan agar modal tidak bocor ke bawah */
                  <div className="space-y-2 rounded-2xl border border-gray-100 bg-gray-50 p-3 max-h-56 overflow-y-auto">
                    {recipeIngredients.map((ing) => (
                      <div
                        key={ing.id}
                        className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 shadow-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">{ing.name}</p>
                          <p className="text-xs text-gray-400">Stock: {ing.stock ?? '0'}</p>
                        </div>

                        {/* Quantity stepper */}
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => changeQuantity(ing.id, -1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-red-300 hover:text-red-600"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold text-gray-900">
                            {ing.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => changeQuantity(ing.id, 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-red-300 hover:text-red-600"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => openDeleteIngredientPopup(ing)}
                          className="ml-1 rounded-full p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 px-4 py-5 text-center">
                    <p className="text-sm font-semibold text-gray-700">No ingredients selected yet.</p>
                    <p className="mt-1 text-xs text-gray-500">Add ingredients from the dropdown below.</p>
                  </div>
                )}
              </div>

              {/* Add ingredient */}
              <div className="mb-6">
                <label htmlFor="ingredient" className="mb-2 block text-sm font-bold text-gray-700">
                  Add Ingredient
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <select
                    id="ingredient"
                    value={selectedIngredientId}
                    onChange={(e) => setSelectedIngredientId(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-50"
                  >
                    <option value="">Select ingredient</option>
                    {availableIngredients.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} (stock: {ing.stock})
                      </option>
                    ))}
                  </select>

                  {/* Quantity for new ingredient */}
                  <div className="flex shrink-0 items-center gap-1 rounded-2xl border border-gray-200 bg-white px-3">
                    <button
                      type="button"
                      onClick={() => setAddQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition hover:text-red-600"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-gray-900">{addQuantity}</span>
                    <button
                      type="button"
                      onClick={() => setAddQuantity((q) => q + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition hover:text-red-600"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={addIngredientToRecipe}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add
                  </button>
                </div>
              </div>

              {/* Computed stock preview */}
              {recipeIngredients.length > 0 && (
                <div className="mb-5 rounded-2xl bg-blue-50 px-4 py-3">
                  <p className="text-xs font-bold text-blue-700">Computed Stock Preview</p>
                  <p className="mt-0.5 text-sm text-blue-600">
                    With current inventory, this menu can serve{' '}
                    <span className="font-black">
                      {Math.min(
                        ...recipeIngredients.map((ing) =>
                          Math.floor((ing.stock ?? 0) / ing.quantity),
                        ),
                      )}
                    </span>{' '}
                    portions.
                  </p>
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeRecipeModal}
                  className="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
                >
                  Save Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Delete Ingredient Confirmation --- */}
      {deleteIngredientTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-black text-gray-900">Are you sure?</h2>
            <p className="mt-2 text-sm text-gray-500">
              Remove{' '}
              <span className="font-bold text-gray-800">{deleteIngredientTarget.name}</span>{' '}
              from this recipe?
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={closeDeleteIngredientPopup}
                className="rounded-2xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteIngredient}
                className="rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default AdminMenuManagement
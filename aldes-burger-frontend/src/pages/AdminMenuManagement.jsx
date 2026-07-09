import {
  AlertTriangle,
  Minus,
  Pencil,
  Plus,
  PlusCircle,
  Trash2,
  Utensils,
  X,
  Loader2,
  CheckCircle2,
  Search,
  ListChecks,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useTranslation } from '../context/LanguageContext'

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
  const { t } = useTranslation()
  const [menu, setMenu] = useState([])
  const [allIngredients, setAllIngredients] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Edit price modal
  const [selectedMenu, setSelectedMenu] = useState(null)
  const [newPrice, setNewPrice] = useState('')
  const [isSavingPrice, setIsSavingPrice] = useState(false)

  // Recipe modal
  const [recipeMenu, setRecipeMenu] = useState(null)
  const [recipeIngredients, setRecipeIngredients] = useState([])

  // Ingredient picker modal
  const [isIngredientPickerOpen, setIsIngredientPickerOpen] = useState(false)
  const [ingredientSearch, setIngredientSearch] = useState('')
  const [checkedIngredientIds, setCheckedIngredientIds] = useState([])

  // Saving recipe state
  const [isSavingRecipe, setIsSavingRecipe] = useState(false)

  // Success notification
  const [successMessage, setSuccessMessage] = useState('')

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

  const showSuccessNotification = (message) => {
    setSuccessMessage(message)

    setTimeout(() => {
      setSuccessMessage('')
    }, 2500)
  }

  // --- edit price ---
  const openEditPriceModal = (menu) => {
    setSelectedMenu(menu)
    setNewPrice(menu.price)
  }

  const closeEditPriceModal = () => {
    if (isSavingPrice) return

    setSelectedMenu(null)
    setNewPrice('')
  }

  const submitEditPrice = async (e) => {
    e.preventDefault()

    if (isSavingPrice) return

    const nextPrice = Number(newPrice)
    if (Number.isNaN(nextPrice)) return

    try {
      setIsSavingPrice(true)

      await api.put(`/admin/menus/${selectedMenu.id}`, {
        price: nextPrice,
      })

      await loadMenu()

      setSelectedMenu(null)
      setNewPrice('')

      showSuccessNotification('Price changes have been saved successfully.')
    } catch (error) {
      console.error(error)
    } finally {
      setIsSavingPrice(false)
    }
  }

  // --- recipe modal ---
  const openRecipeModal = (menu) => {
    setRecipeMenu(menu)

    const normalised = (menu.ingredients ?? []).map((ing) => ({
      id: ing.id,
      name: ing.name,
      stock: ing.stock,
      quantity: ing.pivot?.quantity ?? ing.quantity ?? 1,
    }))

    setRecipeIngredients(normalised)
  }

  const closeRecipeModal = () => {
    if (isSavingRecipe) return

    setRecipeMenu(null)
    setRecipeIngredients([])
    setDeleteIngredientTarget(null)
    setIsIngredientPickerOpen(false)
    setIngredientSearch('')
    setCheckedIngredientIds([])
  }

  const changeQuantity = (id, delta) => {
    if (isSavingRecipe) return

    setRecipeIngredients((prev) =>
      prev.map((ing) =>
        ing.id === id
          ? {
              ...ing,
              quantity: Math.max(1, ing.quantity + delta),
            }
          : ing,
      ),
    )
  }

  const openDeleteIngredientPopup = (ingredient) => {
    if (isSavingRecipe) return
    setDeleteIngredientTarget(ingredient)
  }

  const closeDeleteIngredientPopup = () => {
    if (isSavingRecipe) return
    setDeleteIngredientTarget(null)
  }

  const confirmDeleteIngredient = () => {
    if (!deleteIngredientTarget || isSavingRecipe) return

    setRecipeIngredients(
      recipeIngredients.filter((ing) => ing.id !== deleteIngredientTarget.id),
    )

    closeDeleteIngredientPopup()
  }

  const submitRecipe = async (e) => {
    e.preventDefault()

    if (isSavingRecipe) return

    try {
      setIsSavingRecipe(true)

      await api.put(`/admin/menus/${recipeMenu.id}`, {
        ingredients: recipeIngredients.map((ing) => ({
          id: ing.id,
          quantity: ing.quantity,
        })),
      })

      await loadMenu()

      setRecipeMenu(null)
      setRecipeIngredients([])
      setDeleteIngredientTarget(null)
      setIsIngredientPickerOpen(false)
      setIngredientSearch('')
      setCheckedIngredientIds([])

      showSuccessNotification('Recipe has been saved successfully.')
    } catch (error) {
      console.error(error)
    } finally {
      setIsSavingRecipe(false)
    }
  }

  // --- ingredient picker ---
  const openIngredientPicker = () => {
    if (isSavingRecipe) return

    setCheckedIngredientIds(recipeIngredients.map((ing) => String(ing.id)))
    setIngredientSearch('')
    setIsIngredientPickerOpen(true)
  }

  const closeIngredientPicker = () => {
    if (isSavingRecipe) return

    setIsIngredientPickerOpen(false)
    setIngredientSearch('')
    setCheckedIngredientIds([])
  }

  const toggleIngredientCheck = (ingredientId) => {
    if (isSavingRecipe) return

    const stringId = String(ingredientId)

    setCheckedIngredientIds((prev) =>
      prev.includes(stringId)
        ? prev.filter((id) => id !== stringId)
        : [...prev, stringId],
    )
  }

  const selectAllIngredients = () => {
    if (isSavingRecipe) return

    setCheckedIngredientIds(allIngredients.map((ing) => String(ing.id)))
  }

  const clearSelectedIngredients = () => {
    if (isSavingRecipe) return

    setCheckedIngredientIds([])
  }

  const applyIngredientSelection = () => {
    if (isSavingRecipe) return

    const selectedIngredients = allIngredients.filter((ing) =>
      checkedIngredientIds.includes(String(ing.id)),
    )

    const nextRecipeIngredients = selectedIngredients.map((ing) => {
      const existingIngredient = recipeIngredients.find(
        (item) => String(item.id) === String(ing.id),
      )

      return (
        existingIngredient ?? {
          id: ing.id,
          name: ing.name,
          stock: ing.stock,
          quantity: 1,
        }
      )
    })

    setRecipeIngredients(nextRecipeIngredients)
    setIsIngredientPickerOpen(false)
    setIngredientSearch('')
  }

  const filteredIngredients = allIngredients.filter((ing) =>
    ing.name.toLowerCase().includes(ingredientSearch.toLowerCase()),
  )

  const computedStock =
    recipeIngredients.length > 0
      ? Math.min(
          ...recipeIngredients.map((ing) =>
            Math.floor((ing.stock ?? 0) / ing.quantity),
          ),
        )
      : 0

  // --- render ---
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-aldesCream">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-red-600" />
          <p className="text-sm font-bold text-gray-500">
            Loading Menu Management...
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen bg-aldesCream px-4 py-8 sm:px-6">
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed right-5 top-5 z-[80] rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-black text-gray-900">Success</p>
              <p className="text-xs font-semibold text-gray-500">
                {successMessage}
              </p>
            </div>
          </div>
        </div>
      )}

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
                {t('adminMenu.title')}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage menu prices and preset recipes. Stock is computed live
                from ingredient inventory.
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
                    <h2 className="text-lg font-bold text-gray-900">
                      {item.name}
                    </h2>

                    <p className="mt-0.5 text-sm text-gray-500">
                      {item.description}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {item.price > 0 && (
                        <span className="rounded-full bg-yellow-50 px-3 py-1 text-sm font-bold text-gray-800">
                          Rp {Number(item.price).toLocaleString('id-ID')}
                        </span>
                      )}

                      <StockBadge stock={item.computed_stock} />

                      {!!item.is_custom && (
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                          {t('adminMenu.isCustom')}
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
                    {t('adminMenu.editMenu')}
                  </button>

                  <button
                    type="button"
                    onClick={() => openRecipeModal(item)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
                  >
                    <PlusCircle className="h-4 w-4" />
                    {t('adminMenu.manageIngredients')}
                  </button>
                </div>
              </div>

              {/* Ingredients row */}
              <div className="mt-5 border-t border-gray-100 pt-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
                  {t('adminMenu.ingredients')}
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
                  <p className="text-sm text-gray-400">
                    No ingredients added yet.
                  </p>
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

            <h2 className="text-lg font-bold text-gray-900">
              {t('adminMenu.noMenu')}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Menu data will appear here after it is loaded.
            </p>
          </div>
        )}
      </section>

      {/* --- Edit Price Modal --- */}
      {selectedMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-xl">
            {/* Saving overlay */}
            {isSavingPrice && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-white/70 backdrop-blur-[3px]">
                <div className="flex w-[260px] flex-col items-center gap-3 rounded-3xl border border-orange-100 bg-white px-7 py-6 text-center shadow-xl">
                  <Loader2 className="h-9 w-9 animate-spin text-red-600" />

                  <div>
                    <p className="text-sm font-black text-gray-900">
                      Saving Price...
                    </p>

                    <p className="mt-1 text-xs font-semibold leading-relaxed text-gray-500">
                      Please wait, your changes are being saved.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                  <Pencil className="h-4 w-4" />
                  {t('adminMenu.editMenu')}
                </div>

                <h2 className="text-xl font-black text-gray-900">
                  {selectedMenu.name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update the menu price below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditPriceModal}
                disabled={isSavingPrice}
                className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitEditPrice}>
              <div className="mb-5">
                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-bold text-gray-700"
                >
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
                    disabled={isSavingPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-4 py-3 text-sm font-semibold text-gray-900 outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70"
                    placeholder="Enter new price"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditPriceModal}
                  disabled={isSavingPrice}
                  className="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t('common.cancel')}
                </button>

                <button
                  type="submit"
                  disabled={isSavingPrice}
                  className="inline-flex min-w-[135px] items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
                >
                  {isSavingPrice ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('common.loading')}
                    </>
                  ) : (
                    t('common.save')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Manage Recipe Modal --- */}
      {recipeMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            {/* Saving overlay */}
            {isSavingRecipe && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-[3px]">
                <div className="flex w-[280px] flex-col items-center gap-3 rounded-3xl border border-orange-100 bg-white px-7 py-6 text-center shadow-xl">
                  <Loader2 className="h-9 w-9 animate-spin text-red-600" />

                  <div>
                    <p className="text-sm font-black text-gray-900">
                      Saving Recipe...
                    </p>

                    <p className="mt-1 text-xs font-semibold leading-relaxed text-gray-500">
                      Please wait, your changes are being saved.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Header */}
            <div className="shrink-0 border-b border-gray-100 px-7 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                    <Utensils className="h-4 w-4" />
                    {t('adminMenu.manageIngredients')}
                  </div>

                  <h2 className="text-2xl font-black leading-tight text-gray-900">
                    {recipeMenu.name}
                  </h2>

                  <p className="mt-1 text-sm leading-relaxed text-gray-500">
                    Select ingredients and set their quantity per portion.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeRecipeModal}
                  disabled={isSavingRecipe}
                  className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form
              onSubmit={submitRecipe}
              className="flex min-h-0 flex-1 flex-col"
            >
              {/* Modal Body */}
              <div className="min-h-0 flex-1 overflow-y-auto px-7 py-5">
                {/* Current ingredients */}
                <div className="mb-6">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-black text-gray-700">
                      Selected Ingredients
                    </p>

                    <p className="text-xs font-semibold text-gray-400">
                      {recipeIngredients.length} items
                    </p>
                  </div>

                  {recipeIngredients.length > 0 ? (
                    <div className="space-y-2 rounded-3xl border border-gray-100 bg-gray-50 p-3">
                      {recipeIngredients.map((ing) => (
                        <div
                          key={ing.id}
                          className="grid grid-cols-[1fr_120px_36px] items-center gap-4 rounded-2xl bg-white px-4 py-3 shadow-sm"
                        >
                          {/* Ingredient info */}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-gray-900">
                              {ing.name}
                            </p>

                            <p className="mt-0.5 text-xs font-medium text-gray-400">
                              Stock: {ing.stock ?? '0'}
                            </p>
                          </div>

                          {/* Quantity stepper */}
                          <div className="flex h-10 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-2">
                            <button
                              type="button"
                              disabled={isSavingRecipe}
                              onClick={() => changeQuantity(ing.id, -1)}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>

                            <span className="w-5 text-center text-sm font-black text-gray-900">
                              {ing.quantity}
                            </span>

                            <button
                              type="button"
                              disabled={isSavingRecipe}
                              onClick={() => changeQuantity(ing.id, 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Delete button */}
                          <button
                            type="button"
                            disabled={isSavingRecipe}
                            onClick={() => openDeleteIngredientPopup(ing)}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-orange-200 bg-orange-50/40 px-4 py-6 text-center">
                      <p className="text-sm font-bold text-gray-700">
                        No ingredients selected yet.
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Choose ingredients from the ingredient picker.
                      </p>
                    </div>
                  )}
                </div>

                {/* Choose ingredients */}
                <div>
                  <label className="mb-3 block text-sm font-black text-gray-700">
                    Ingredient Picker
                  </label>

                  <button
                    type="button"
                    disabled={isSavingRecipe}
                    onClick={openIngredientPicker}
                    className="flex w-full items-center justify-between rounded-3xl border border-red-100 bg-red-50 px-5 py-4 text-left transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm">
                        <ListChecks className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-black text-gray-900">
                          Choose Ingredients
                        </p>

                        <p className="mt-0.5 text-xs font-semibold text-gray-500">
                          Select multiple ingredients using checkboxes.
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-red-600 shadow-sm">
                      {recipeIngredients.length} selected
                    </span>
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="shrink-0 border-t border-gray-100 bg-white px-7 py-5">
                {recipeIngredients.length > 0 && (
                  <div className="mb-4 rounded-3xl border border-blue-100 bg-blue-50 px-5 py-4">
                    <p className="text-xs font-black text-blue-700">
                      Computed Stock Preview
                    </p>

                    <p className="mt-1 text-sm leading-relaxed text-blue-600">
                      With current inventory, this menu can serve{' '}
                      <span className="font-black">{computedStock}</span>{' '}
                      portions.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={isSavingRecipe}
                    onClick={closeRecipeModal}
                    className="h-12 rounded-2xl border border-gray-200 px-6 text-sm font-black text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {t('common.cancel')}
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingRecipe}
                    className="inline-flex h-12 min-w-[170px] items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 text-sm font-black text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
                  >
                    {isSavingRecipe ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('common.loading')}
                      </>
                    ) : (
                      t('common.save')
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Ingredient Picker Popup --- */}
      {isIngredientPickerOpen && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="flex max-h-[82vh] w-full max-w-xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            {/* Header */}
            <div className="shrink-0 border-b border-gray-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                    <ListChecks className="h-4 w-4" />
                    Ingredient Selection
                  </div>

                  <h2 className="text-xl font-black text-gray-900">
                    Choose Ingredients
                  </h2>

                  <p className="mt-1 text-sm leading-relaxed text-gray-500">
                    Check the ingredients that should be included in this
                    recipe.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeIngredientPicker}
                  className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search */}
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 focus-within:border-red-300 focus-within:ring-4 focus-within:ring-red-50">
                <Search className="h-4 w-4 text-gray-400" />

                <input
                  type="text"
                  value={ingredientSearch}
                  onChange={(e) => setIngredientSearch(e.target.value)}
                  className="w-full text-sm font-semibold text-gray-700 outline-none"
                  placeholder="Search ingredient..."
                />
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-gray-400">
                  {checkedIngredientIds.length} of {allIngredients.length}{' '}
                  selected
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={clearSelectedIngredients}
                    className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-black text-gray-600 transition hover:bg-gray-50"
                  >
                    Clear
                  </button>

                  <button
                    type="button"
                    onClick={selectAllIngredients}
                    className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-black text-red-600 transition hover:bg-red-100"
                  >
                    Select All
                  </button>
                </div>
              </div>
            </div>

            {/* Ingredient list */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              {filteredIngredients.length > 0 ? (
                <div className="space-y-2">
                  {filteredIngredients.map((ing) => {
                    const isChecked = checkedIngredientIds.includes(
                      String(ing.id),
                    )

                    return (
                      <button
                        key={ing.id}
                        type="button"
                        onClick={() => toggleIngredientCheck(ing.id)}
                        className={`flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition ${
                          isChecked
                            ? 'border-red-200 bg-red-50'
                            : 'border-gray-100 bg-white hover:border-red-100 hover:bg-red-50/40'
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
                              isChecked
                                ? 'border-red-600 bg-red-600'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {isChecked && (
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-gray-900">
                              {ing.name}
                            </p>

                            <p className="mt-0.5 text-xs font-semibold text-gray-400">
                              Stock: {ing.stock ?? '0'}
                            </p>
                          </div>
                        </div>

                        {isChecked && (
                          <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-red-600 shadow-sm">
                            Selected
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-gray-200 px-4 py-8 text-center">
                  <p className="text-sm font-black text-gray-700">
                    No ingredients found
                  </p>

                  <p className="mt-1 text-xs font-semibold text-gray-400">
                    Try using another keyword.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-5">
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeIngredientPicker}
                  className="h-12 rounded-2xl border border-gray-200 px-6 text-sm font-black text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={applyIngredientSelection}
                  className="inline-flex h-12 min-w-[160px] items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 text-sm font-black text-white shadow-sm transition hover:bg-red-700"
                >
                  Apply Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Delete Ingredient Confirmation --- */}
      {deleteIngredientTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 className="h-7 w-7" />
            </div>

            <h2 className="text-xl font-black text-gray-900">
              Are you sure?
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Remove{' '}
              <span className="font-bold text-gray-800">
                {deleteIngredientTarget.name}
              </span>{' '}
              from this recipe?
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                disabled={isSavingRecipe}
                onClick={closeDeleteIngredientPopup}
                className="rounded-2xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSavingRecipe}
                onClick={confirmDeleteIngredient}
                className="rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
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
import { Pencil, PlusCircle, Trash2, Utensils, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../lib/api'

function AdminMenuManagement() {
  const [menu, setMenu] = useState([])
  const [allIngredients, setAllIngredients] = useState([])

  const [selectedMenu, setSelectedMenu] = useState(null)
  const [newPrice, setNewPrice] = useState('')

  const [recipeMenu, setRecipeMenu] = useState(null)
  const [recipeIngredients, setRecipeIngredients] = useState([])
  const [selectedIngredientId, setSelectedIngredientId] = useState('')

  const [deleteIngredientTarget, setDeleteIngredientTarget] = useState(null)

  const loadMenu = () =>
    api
      .get('/admin/menus')
      .then(({ data }) => {
        setMenu(data)

        const ingredientsFromMenu = data.flatMap((item) => item.ingredients ?? [])
        const uniqueIngredients = ingredientsFromMenu.filter(
          (ingredient, index, self) =>
            index === self.findIndex((item) => item.id === ingredient.id)
        )

        setAllIngredients(uniqueIngredients)
      })
      .catch(() => setMenu([]))

  const loadIngredients = () =>
    api
      .get('/admin/ingredients')
      .then(({ data }) => setAllIngredients(data))
      .catch(() => {})

  useEffect(() => {
    loadMenu()
    loadIngredients()
  }, [])

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

  const openRecipeModal = (menu) => {
    setRecipeMenu(menu)
    setRecipeIngredients(menu.ingredients ?? [])
    setSelectedIngredientId('')
  }

  const closeRecipeModal = () => {
    setRecipeMenu(null)
    setRecipeIngredients([])
    setSelectedIngredientId('')
    setDeleteIngredientTarget(null)
  }

  const addIngredientToRecipe = () => {
    if (!selectedIngredientId) return

    const ingredient = allIngredients.find(
      (item) => String(item.id) === String(selectedIngredientId)
    )

    if (!ingredient) return

    const alreadyExists = recipeIngredients.some(
      (item) => item.id === ingredient.id
    )

    if (alreadyExists) return

    setRecipeIngredients([...recipeIngredients, ingredient])
    setSelectedIngredientId('')
  }

  const openDeleteIngredientPopup = (ingredient) => {
    setDeleteIngredientTarget(ingredient)
  }

  const closeDeleteIngredientPopup = () => {
    setDeleteIngredientTarget(null)
  }

  const confirmDeleteIngredient = () => {
    if (!deleteIngredientTarget) return

    setRecipeIngredients(
      recipeIngredients.filter(
        (ingredient) => ingredient.id !== deleteIngredientTarget.id
      )
    )

    closeDeleteIngredientPopup()
  }

  const submitRecipe = async (e) => {
    e.preventDefault()

    await api.put(`/admin/menus/${recipeMenu.id}`, {
      ingredient_ids: recipeIngredients.map((ingredient) => ingredient.id),
    })

    closeRecipeModal()
    loadMenu()
  }

  const availableIngredients = allIngredients.filter(
    (ingredient) =>
      !recipeIngredients.some(
        (recipeIngredient) => recipeIngredient.id === ingredient.id
      )
  )

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
                Manage menu prices and preset recipes in one simple page.
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
          {menu.map((menu) => (
            <article
              key={menu.id}
              className="group rounded-3xl border border-orange-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <Utensils className="h-6 w-6" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {menu.name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Standard Ingredients · Preset Recipe
                    </p>

                    {menu.price && (
                      <p className="mt-2 inline-flex rounded-full bg-yellow-50 px-3 py-1 text-sm font-bold text-gray-800">
                        Rp {Number(menu.price).toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEditPriceModal(menu)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Price
                  </button>

                  <button
                    type="button"
                    onClick={() => openRecipeModal(menu)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Manage Recipe
                  </button>
                </div>
              </div>

              <div className="mt-5 border-t border-gray-100 pt-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
                  Ingredients
                </p>

                {menu.ingredients?.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {menu.ingredients.map((ingredient) => (
                      <li
                        key={`${menu.id}-${ingredient.id}`}
                        className="rounded-full bg-yellow-100 px-3 py-1.5 text-sm font-medium text-gray-800"
                      >
                        {ingredient.name}
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
              No menu available
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Menu data will appear here after it is loaded.
            </p>
          </div>
        )}
      </section>

      {/* Edit Price Modal */}
      {selectedMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                  <Pencil className="h-4 w-4" />
                  Edit Menu Price
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
                className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
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

      {/* Manage Recipe Modal */}
      {recipeMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                  <Utensils className="h-4 w-4" />
                  Manage Recipe
                </div>

                <h2 className="text-xl font-black text-gray-900">
                  {recipeMenu.name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Add or remove ingredients for this menu.
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
              <div className="mb-5">
                <p className="mb-3 text-sm font-bold text-gray-700">
                  Current Ingredients
                </p>

                {recipeIngredients.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {recipeIngredients.map((ingredient) => (
                      <div
                        key={ingredient.id}
                        className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1.5 text-sm font-semibold text-gray-800"
                      >
                        <span>{ingredient.name}</span>

                        <button
                          type="button"
                          onClick={() => openDeleteIngredientPopup(ingredient)}
                          className="rounded-full p-1 text-gray-500 transition hover:bg-white/70 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 px-4 py-5 text-center">
                    <p className="text-sm font-semibold text-gray-700">
                      No ingredients selected yet.
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Add ingredients from the dropdown below.
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label
                  htmlFor="ingredient"
                  className="mb-2 block text-sm font-bold text-gray-700"
                >
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

                    {availableIngredients.map((ingredient) => (
                      <option key={ingredient.id} value={ingredient.id}>
                        {ingredient.name}
                      </option>
                    ))}
                  </select>

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

      {/* Delete Ingredient Confirmation Popup */}
      {deleteIngredientTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 className="h-7 w-7" />
            </div>

            <h2 className="text-xl font-black text-gray-900">
              Are you sure?
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Are you sure to delete{' '}
              <span className="font-bold text-gray-800">
                {deleteIngredientTarget.name}
              </span>{' '}
              from this menu?
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
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default AdminMenuManagement
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Package,
  PencilLine,
  X,
} from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import api from '../lib/api'
import GifLoader from '../components/GifLoader'
import { useTranslation } from '../context/LanguageContext'

// helpers
function StockBadge({ stock }) {
  const low = stock <= 5
  const mid = stock <= 20

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        low
          ? 'bg-red-100 text-red-700'
          : mid
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-emerald-100 text-emerald-700'
      }`}
    >
      {low && <AlertTriangle className="h-3 w-3" />}
      {stock}
    </span>
  )
}

let cachedInventory = null

// component
function AdminInventory() {
  const { t } = useTranslation()
  const [inventory, setInventory] = useState(cachedInventory || [])
  const [isLoadingInventory, setIsLoadingInventory] = useState(!cachedInventory)

  const [editTarget, setEditTarget] = useState(null)
  const [editStock, setEditStock] = useState('')
  const [isSavingStock, setIsSavingStock] = useState(false)

  const [successMessage, setSuccessMessage] = useState('')

  const loadInventory = async ({ showLoading = false, force = false } = {}) => {
    if (!force && cachedInventory) {
      setInventory(cachedInventory)
      setIsLoadingInventory(false)
      return
    }
    if (showLoading && !cachedInventory) setIsLoadingInventory(true)

    try {
      const { data } = await api.get('/admin/inventory')
      setInventory(data)
      cachedInventory = data
    } catch (error) {
      console.error(error)
      setInventory([])
    } finally {
      setIsLoadingInventory(false)
    }
  }

  useEffect(() => {
    loadInventory({ showLoading: true, force: false })
  }, [])

 const showSuccessNotification = (message) => {
    setSuccessMessage(message)

    setTimeout(() => {
      setSuccessMessage('')
    }, 2500)
  }

  /* — open/close edit modal — */
  const openEdit = (item) => {
    setEditTarget(item)
    setEditStock(String(item.stock))
  }

  const closeEdit = () => {
    if (isSavingStock) return

    setEditTarget(null)
    setEditStock('')
  }

  const submitEdit = async (e) => {
    e.preventDefault()

    if (isSavingStock) return

    const stock = Number(editStock)
    if (Number.isNaN(stock) || stock < 0) return

    try {
      setIsSavingStock(true)

      await api.patch(`/admin/inventory/${editTarget.id}`, { stock })

      await loadInventory({ force: true })

      setEditTarget(null)
      setEditStock('')

      showSuccessNotification('Stock changes have been saved successfully.')
    } catch (error) {
      console.error(error)
    } finally {
      setIsSavingStock(false)
    }
  }

  // LOGIKA BARU: Menyaring data agar item berharga (> 0) di atas, dan yang berharga 0 / strip di bawah
  const sortedInventory = useMemo(() => {
    return [...inventory].sort((a, b) => {
      const priceA = Number(a.price || 0)
      const priceB = Number(b.price || 0)

      // Jika A punya harga dan B tidak, A naik ke atas
      if (priceA > 0 && priceB <= 0) return -1
      // Jika B punya harga dan A tidak, B naik ke atas
      if (priceA <= 0 && priceB > 0) return 1

      // Jika keduanya sama-sama punya harga atau sama-sama strip, urutkan alfabetis berdasarkan nama
      return a.name.localeCompare(b.name)
    })
  }, [inventory])

  /* render */
  const lowStockCount = inventory.filter((i) => i.stock <= 5).length

  return (
    <main className="relative min-h-screen bg-aldesCream px-4 py-6 sm:px-6">
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

      <section className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-orange-100 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                <Package className="h-4 w-4" />
                Aldes Burger Admin
              </div>

              <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
                {t('adminInventory.title')}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Update ingredient stock. Menu availability is computed
                automatically from inventory.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="rounded-2xl bg-aldesCream px-4 py-3 text-center">
                <p className="text-xs font-medium text-gray-500">
                  Total Items
                </p>

                {isLoadingInventory ? (
                  <div className="mt-1 flex items-center justify-center">
                    <div className="h-8 w-12 rounded-lg bg-red-200 animate-pulse"></div>
                  </div>
                ) : (
                  <p className="text-2xl font-black text-red-600">
                    {inventory.length}
                  </p>
                )}
              </div>

              {!isLoadingInventory && lowStockCount > 0 && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-center">
                  <p className="text-xs font-medium text-red-500">
                    {t('adminInventory.lowStock')}
                  </p>

                  <p className="text-2xl font-black text-red-600">
                    {lowStockCount}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-red-100 bg-red-50">
                  <th className="px-4 py-3 font-bold text-gray-600">
                    {t('adminInventory.ingredientName')}
                  </th>
                  <th className="px-4 py-3 font-bold text-gray-600">
                    {t('adminInventory.stock')}
                  </th>
                  <th className="px-4 py-3 font-bold text-gray-600">
                    {t('adminInventory.price')}
                  </th>
                  <th className="px-4 py-3 font-bold text-gray-600">
                    Used in Menus
                  </th>
                  <th className="px-4 py-3 font-bold text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoadingInventory && (
                  <tr>
                    <td colSpan={5} className="px-4 py-14">
                      <div className="flex flex-col items-center justify-center gap-3 text-center">
                        <div className="flex items-center justify-center py-12">
                          <GifLoader isLoading={true} size="w-32" text={t('common.loadingInventory')} />
                        </div>

                        <div>
                          <p className="text-sm font-black text-gray-800">
                            Loading inventory data...
                          </p>

                          <p className="mt-1 text-xs font-semibold text-gray-400">
                            Please wait while the latest stock data is being
                            loaded.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}

                {/* DIUBAH: Memakai sortedInventory dan pengecekan loading */}
                {!isLoadingInventory &&
                  sortedInventory.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-gray-50 transition hover:bg-orange-50/40"
                    >
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {item.name}
                      </td>

                      <td className="px-4 py-3">
                        <StockBadge stock={item.stock} />
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {item.price > 0 ? (
                          `Rp ${Number(item.price).toLocaleString('id-ID')}`
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {item.menus?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.menus.map((m, idx) => (
                              <span
                                key={`${m.id}-${idx}`}
                                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  m.is_custom
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-yellow-100 text-gray-800'
                                }`}
                                title={
                                  m.is_custom
                                    ? 'Used in custom burgers'
                                    : `×${m.quantity} per portion`
                                }
                              >
                                {m.is_custom && '🍔 '}
                                {m.name}

                                {!m.is_custom && m.quantity > 1 && (
                                  <span className="ml-1 font-bold text-yellow-700">
                                    ×{m.quantity}
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700"
                        >
                          <PencilLine className="h-3.5 w-3.5" />
                          {t('adminInventory.editIngredient')}
                        </button>
                      </td>
                    </tr>
                  ))}

                {!isLoadingInventory && sortedInventory.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm text-gray-400"
                    >
                      {t('adminInventory.noIngredients')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Edit Stock Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 shadow-xl">
            {/* Saving overlay */}
            {isSavingStock && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-white/70 backdrop-blur-[3px]">
                <div className="flex w-[260px] flex-col items-center gap-3 rounded-3xl border border-orange-100 bg-white px-7 py-6 text-center shadow-xl">
                  <Loader2 className="h-9 w-9 animate-spin text-red-600" />

                  <div>
                    <p className="text-sm font-black text-gray-900">
                      Saving Stock...
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
                  <Package className="h-4 w-4" />
                  {t('adminInventory.editIngredient')}
                </div>

                <h2 className="text-xl font-black text-gray-900">
                  {editTarget.name}
                </h2>

                <p className="mt-0.5 text-sm text-gray-500">
                  Current stock:{' '}
                  <span className="font-bold text-gray-800">
                    {editTarget.stock}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                disabled={isSavingStock}
                className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Impact info — only for recipe-based (non-custom) menus */}
            {editTarget.menus?.filter((m) => !m.is_custom).length > 0 && (
              <div className="mb-5 rounded-2xl bg-yellow-50 px-4 py-3">
                <p className="text-xs font-bold text-yellow-700">
                  ⚡ Impacts computed stock of:
                </p>

                <ul className="mt-1.5 space-y-1">
                  {editTarget.menus
                    .filter((m) => !m.is_custom)
                    .map((m) => (
                      <li key={m.id} className="text-xs text-yellow-800">
                        • <span className="font-semibold">{m.name}</span>{' '}
                        <span className="text-yellow-600">
                          (uses ×{m.quantity} per portion)
                        </span>
                        {' → '}
                        <span className="font-bold">
                          {Math.floor(Number(editStock || 0) / m.quantity)}{' '}
                          portions possible
                        </span>
                      </li>
                    ))}
                </ul>

                {editTarget.menus.some((m) => m.is_custom) && (
                  <p className="mt-2 text-xs font-medium text-purple-600">
                    🍔 Also used in custom burgers (variable amounts)
                  </p>
                )}
              </div>
            )}

            <form onSubmit={submitEdit}>
              <div className="mb-5">
                <label
                  htmlFor="stock"
                  className="mb-2 block text-sm font-bold text-gray-700"
                >
                  New Stock
                </label>

                <input
                  id="stock"
                  type="number"
                  min={0}
                  value={editStock}
                  disabled={isSavingStock}
                  onChange={(e) => setEditStock(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70"
                  required
                />
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={isSavingStock}
                  className="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t('common.cancel')}
                </button>

                <button
                  type="submit"
                  disabled={isSavingStock}
                  className="inline-flex min-w-[135px] items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
                >
                  {isSavingStock ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('common.loading')}
                    </>
                  ) : (
                    t('adminInventory.save')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default AdminInventory
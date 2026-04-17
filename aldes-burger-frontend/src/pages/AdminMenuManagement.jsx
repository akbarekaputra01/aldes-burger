import { CookingPot, Pencil, PlusCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../lib/api'

function AdminMenuManagement() {
  const [menus, setMenus] = useState([])

  const loadMenus = () => api.get('/admin/menus').then(({ data }) => setMenus(data)).catch(() => setMenus([]))

  useEffect(() => {
    loadMenus()
  }, [])

  const quickEditPrice = async (menu) => {
    const nextPrice = Number(prompt(`Set new price for ${menu.name}`, menu.price))
    if (Number.isNaN(nextPrice)) return
    await api.put(`/admin/menus/${menu.id}`, { price: nextPrice })
    loadMenus()
  }

  return (
    <main className="min-h-screen bg-aldesCream px-4 py-6 sm:px-6">
      <section className="mx-auto max-w-6xl">
        <h1 className="mb-6 flex items-center gap-2 text-2xl font-black text-gray-900"><CookingPot className="h-6 w-6 text-red-600" />Admin Menu Management</h1>
        <div className="space-y-4">
          {menus.map((menu) => (
            <article key={menu.id} className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{menu.name}</h2>
                  <p className="mt-1 text-sm text-gray-500">Standard Ingredients (preset recipe)</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => quickEditPrice(menu)} className="inline-flex items-center gap-1 rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><Pencil className="h-4 w-4" /> Edit Price</button>
                  <button type="button" className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"><PlusCircle className="h-4 w-4" /> Manage Recipe</button>
                </div>
              </div>
              <ul className="mt-4 flex flex-wrap gap-2">
                {(menu.ingredients ?? []).map((ingredient) => (
                  <li key={`${menu.id}-${ingredient.id}`} className="rounded-xl bg-yellow-100 px-3 py-1.5 text-sm text-gray-800">{ingredient.name}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default AdminMenuManagement

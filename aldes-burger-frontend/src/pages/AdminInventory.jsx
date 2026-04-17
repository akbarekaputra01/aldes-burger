import { Package, PencilLine } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../lib/api'

function AdminInventory() {
  const [inventory, setInventory] = useState([])

  const loadInventory = () => api.get('/admin/inventory').then(({ data }) => setInventory(data)).catch(() => setInventory([]))

  useEffect(() => {
    loadInventory()
  }, [])

  const quickUpdate = async (item) => {
    const stock = Number(prompt(`New stock for ${item.name}`, item.stock))
    if (Number.isNaN(stock)) return
    await api.patch(`/admin/inventory/${item.id}`, { stock })
    loadInventory()
  }

  return (
    <main className="min-h-screen bg-aldesCream px-4 py-6 sm:px-6">
      <section className="mx-auto max-w-6xl rounded-3xl bg-white p-5 shadow-sm sm:p-6">
        <h1 className="mb-5 flex items-center gap-2 text-2xl font-black text-gray-900"><Package className="h-6 w-6 text-red-600" />Inventory Management</h1>
        <div className="overflow-x-auto rounded-2xl border border-red-100">
          <table className="min-w-full text-left text-sm">
            <thead><tr className="bg-red-50 text-gray-600"><th className="px-3 py-3">Type</th><th className="px-3 py-3">Name</th><th className="px-3 py-3">Stock</th><th className="px-3 py-3">Action</th></tr></thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} className="border-t border-red-50">
                  <td className="px-3 py-3 text-gray-700">Ingredient</td>
                  <td className="px-3 py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.stock < 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-emerald-100 text-emerald-700'}`}>{item.stock}</span></td>
                  <td className="px-3 py-3"><button type="button" onClick={() => quickUpdate(item)} className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-3 py-1.5 font-medium text-white transition hover:bg-red-700"><PencilLine className="h-4 w-4" /> Quick Update</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default AdminInventory

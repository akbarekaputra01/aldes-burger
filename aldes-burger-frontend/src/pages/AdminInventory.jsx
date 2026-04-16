import { Package, PencilLine } from 'lucide-react'

const inventory = [
  { id: 'ing-1', type: 'Ingredient', name: 'Tomato', stock: 6 },
  { id: 'ing-2', type: 'Ingredient', name: 'Cheddar', stock: 18 },
  { id: 'ing-3', type: 'Ingredient', name: 'Beef Patty', stock: 8 },
  { id: 'menu-1', type: 'Menu', name: 'Double Beef Burger', stock: 20 },
  { id: 'menu-2', type: 'Menu', name: 'Spicy Chicken Burger', stock: 9 },
]

function AdminInventory() {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6">
      <section className="mx-auto max-w-6xl rounded-3xl bg-white p-5 shadow-sm sm:p-6">
        <h1 className="mb-5 flex items-center gap-2 text-2xl font-black text-gray-800"><Package className="h-6 w-6 text-orange-500" />Inventory Management</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Stock</th>
                <th className="px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="px-3 py-3 text-gray-700">{item.type}</td>
                  <td className="px-3 py-3 font-medium text-gray-800">{item.name}</td>
                  <td className={`px-3 py-3 font-semibold ${item.stock < 10 ? 'font-bold text-red-600' : 'text-gray-800'}`}>
                    {item.stock}
                  </td>
                  <td className="px-3 py-3">
                    <button type="button" className="inline-flex items-center gap-1 rounded-xl border border-gray-300 px-3 py-1.5 font-medium text-gray-700 transition hover:bg-gray-100">
                      <PencilLine className="h-4 w-4" /> Quick Update
                    </button>
                  </td>
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

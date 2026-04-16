import { CookingPot, Pencil, PlusCircle } from 'lucide-react'

const menus = [
  {
    id: 'm1',
    name: 'Double Beef Burger',
    standardIngredients: ['Top Bun', 'Beef Patty', 'Cheddar', 'Tomato', 'Onion', 'Bottom Bun'],
  },
  {
    id: 'm2',
    name: 'Spicy Crispy Chicken Burger',
    standardIngredients: ['Top Bun', 'Crispy Chicken', 'Lettuce', 'Mayo', 'Bottom Bun'],
  },
]

function AdminMenuManagement() {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6">
      <section className="mx-auto max-w-6xl">
        <h1 className="mb-6 flex items-center gap-2 text-2xl font-black text-gray-800"><CookingPot className="h-6 w-6 text-orange-500" />Admin Menu Management</h1>
        <div className="space-y-4">
          {menus.map((menu) => (
            <article key={menu.id} className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{menu.name}</h2>
                  <p className="mt-1 text-sm text-gray-500">Standard Ingredients (preset recipe)</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="inline-flex items-center gap-1 rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                    <Pencil className="h-4 w-4" /> Edit Recipe
                  </button>
                  <button type="button" className="inline-flex items-center gap-1 rounded-xl bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600">
                    <PlusCircle className="h-4 w-4" /> Add Ingredient to Preset
                  </button>
                </div>
              </div>
              <ul className="mt-4 flex flex-wrap gap-2">
                {menu.standardIngredients.map((ingredient) => (
                  <li key={`${menu.id}-${ingredient}`} className="rounded-xl bg-orange-50 px-3 py-1.5 text-sm text-gray-700">{ingredient}</li>
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

import { Flame } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import api from '../lib/api'

function Menus() {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [menus, setMenus] = useState([])

  useEffect(() => {
    const loadMenus = async () => {
      const { data } = await api.get('/menus')
      setMenus(data)
    }

    loadMenus().catch(() => setMenus([]))
  }, [])

  const addSimpleItem = (item) => {
    addToCart({ id: `menu-${item.id}`, menu_id: item.id, name: item.name, basePrice: item.price, price: item.price, qty: 1, modifiers: [] })
  }

  const burgerMenu = menus.length > 0
    ? menus
    : [
      { id: 1, name: 'Beef Burger - Double Patty', description: 'Premium beef, cheddar cheese, and house special sauce.', price: 55000, is_custom: false },
      { id: 2, name: 'Spicy Crispy Chicken Burger', description: 'Crispy spicy chicken, lettuce, and creamy mayo.', price: 45000, is_custom: false },
      { id: 3, name: 'Make Your Own Burger', description: 'Build your burger from scratch exactly how you like it.', price: 0, is_custom: true },
    ]

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-2xl bg-gray-900 p-8 text-white shadow-md">
        <p className="text-2xl font-black sm:text-3xl">25% OFF FOR NEW CUSTOMERS!</p>
        <p className="mt-2 text-sm sm:text-base">Use code: ALDES25</p>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-extrabold text-aldesRed">OUR BURGER MENU</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {burgerMenu.map((item) => (
            <article
              key={item.id}
              className={`overflow-hidden rounded-xl bg-white shadow-md ${
                item.is_custom ? 'border-2 border-aldesYellow' : 'border border-transparent'
              }`}
            >
              <div className="h-40 bg-gray-200" />
              <div className="p-4">
                {item.is_custom && (
                  <div className="mb-3 inline-flex items-center gap-1 rounded-xl bg-aldesYellow px-2 py-1 text-xs font-bold text-black">
                    <Flame className="h-3.5 w-3.5" /> Hot Feature
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                {!item.is_custom && <p className="mt-3 text-base font-semibold text-aldesRed">Rp {item.price?.toLocaleString('id-ID')}</p>}
                <button
                  type="button"
                  onClick={item.is_custom ? () => navigate('/kitchen', { state: { menuId: item.id } }) : () => addSimpleItem(item)}
                  className={`mt-4 w-full rounded-xl px-4 py-2 font-semibold transition ${
                    item.is_custom
                      ? 'bg-aldesYellow text-black hover:brightness-95'
                      : 'bg-aldesRed text-white hover:brightness-110'
                  }`}
                >
                  {item.is_custom ? 'Start Building ->' : 'Add +'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Menus

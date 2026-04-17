import { Flame } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import api from '../lib/api'

const categories = ['All', 'Beef', 'Chicken', 'Snacks', 'Drinks']

const normalizeCategory = (menu) => {
  const raw = (menu.category ?? '').toLowerCase()
  if (raw.includes('beef')) return 'Beef'
  if (raw.includes('chicken')) return 'Chicken'
  if (raw.includes('snack')) return 'Snacks'
  if (raw.includes('drink')) return 'Drinks'

  const name = (menu.name ?? '').toLowerCase()
  if (name.includes('beef')) return 'Beef'
  if (name.includes('chicken')) return 'Chicken'
  if (name.includes('fries') || name.includes('snack')) return 'Snacks'
  if (name.includes('drink') || name.includes('cola') || name.includes('tea') || name.includes('coffee')) return 'Drinks'

  return 'All'
}

function Menus() {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [menus, setMenus] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [isFetching, setIsFetching] = useState(true)

  const orderMenus = (menuList) => [...menuList].sort((a, b) => {
    const getRank = (item) => {
      if (item.is_custom) return 1
      if (item.name?.toLowerCase().includes('beef')) return 0
      return 2
    }

    const rankDiff = getRank(a) - getRank(b)
    if (rankDiff !== 0) return rankDiff
    return a.name.localeCompare(b.name)
  })

  useEffect(() => {
    const loadMenus = async () => {
      setIsFetching(true)
      const { data } = await api.get('/menus')
      setMenus(orderMenus(data))
      setIsFetching(false)
    }

    loadMenus().catch(() => {
      setMenus([])
      setIsFetching(false)
    })
  }, [])

  const addSimpleItem = (item) => {
    addToCart({ id: `menu-${item.id}`, menu_id: item.id, name: item.name, basePrice: item.price, price: item.price, qty: 1, modifiers: [] })
  }

  const burgerMenu = useMemo(() => (menus.length > 0
    ? menus
    : [
      { id: 1, name: 'Beef Burger - Double Patty', description: 'Premium beef, cheddar cheese, and house special sauce.', price: 55000, is_custom: false },
      { id: 3, name: 'Make Your Own Burger', description: 'Build your burger from scratch exactly how you like it.', price: 0, is_custom: true },
      { id: 2, name: 'Spicy Crispy Chicken Burger', description: 'Crispy spicy chicken, lettuce, and creamy mayo.', price: 45000, is_custom: false },
    ]), [menus])

  const filteredMenus = useMemo(() => {
    if (activeCategory === 'All') return burgerMenu
    return burgerMenu.filter((item) => normalizeCategory(item) === activeCategory)
  }, [activeCategory, burgerMenu])

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 bg-aldesCream px-4 py-6 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl bg-aldesRed p-8 text-white shadow-md">
        <p className="text-2xl font-black sm:text-3xl">25% OFF FOR NEW CUSTOMERS!</p>
        <p className="mt-2 text-sm sm:text-base">Use code: ALDES25</p>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-extrabold text-aldesRed">OUR BURGER MENU</h2>

        <div className="mb-5 flex flex-wrap gap-2">
          {categories.map((category) => {
            const isActive = activeCategory === category
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-aldesRed text-white shadow-sm' : 'bg-aldesYellow/70 text-gray-800 hover:bg-aldesYellow'}`}
              >
                {category}
              </button>
            )
          })}
        </div>

        {isFetching ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-3xl border border-aldesRed/15 bg-white shadow-md">
                <div className="h-40 animate-pulse bg-aldesCream" />
                <div className="space-y-3 p-4">
                  <div className="h-5 w-24 animate-pulse rounded-xl bg-aldesCream" />
                  <div className="h-5 w-4/5 animate-pulse rounded-xl bg-aldesCream" />
                  <div className="h-4 w-full animate-pulse rounded-xl bg-aldesCream" />
                  <div className="h-4 w-2/3 animate-pulse rounded-xl bg-aldesCream" />
                  <div className="mt-4 h-10 w-full animate-pulse rounded-2xl bg-aldesCream" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {filteredMenus.map((item) => (
              <article
                key={item.id}
                className={`overflow-hidden rounded-3xl bg-white shadow-md ${
                  item.is_custom ? 'border-2 border-aldesYellow' : 'border border-transparent'
                }`}
              >
                <div className="h-40 bg-aldesCream" />
                <div className="p-4">
                  <div className={`mb-3 inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-bold ${item.is_custom ? 'bg-aldesYellow text-gray-900' : 'bg-aldesRed/10 text-aldesRed'}`}>
                    {item.is_custom ? <><Flame className="h-3.5 w-3.5" /> Hot Feature</> : normalizeCategory(item)}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                  <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                  {!item.is_custom && <p className="mt-3 text-base font-semibold text-aldesRed">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price ?? 0)}</p>}
                  <button
                    type="button"
                    onClick={item.is_custom ? () => navigate('/kitchen', { state: { menuId: item.id } }) : () => addSimpleItem(item)}
                    className={`mt-4 w-full rounded-2xl px-4 py-2 font-semibold transition ${
                      item.is_custom
                        ? 'bg-aldesYellow text-gray-900 hover:brightness-95'
                        : 'bg-aldesRed text-white hover:brightness-95'
                    }`}
                  >
                    {item.is_custom ? 'Start Building →' : 'Add +'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Menus

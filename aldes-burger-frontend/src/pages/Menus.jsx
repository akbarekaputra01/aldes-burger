import { Flame, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MenuCardSkeleton } from '../components/Skeletons'
import { useCart } from '../context/CartContext'
import api from '../lib/api'

function Menus() {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [menus, setMenus] = useState([])
  const [isFetching, setIsFetching] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeActionId, setActiveActionId] = useState(null)

  const orderMenus = (menuList) => [...menuList].sort((a, b) => {
    const getRank = (item) => {
      if (item.is_custom) return 2
      if (item.name?.toLowerCase().includes('beef')) return 0
      if (item.name?.toLowerCase().includes('chicken')) return 1
      return 3
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

    loadMenus()
      .catch(() => setMenus([]))
      .finally(() => setIsFetching(false))
  }, [])

  const addSimpleItem = (item) => {
    setActiveActionId(item.id)
    addToCart({ id: `menu-${item.id}`, menu_id: item.id, name: item.name, basePrice: item.price, price: item.price, qty: 1, modifiers: [] })
    setTimeout(() => setActiveActionId(null), 250)
  }

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'beef', label: 'Beef' },
    { id: 'chicken', label: 'Chicken' },
  ]

  const filteredMenus = useMemo(() => menus.filter((item) => {
    if (item.is_custom || selectedCategory === 'all') return true
    const name = item.name?.toLowerCase() ?? ''
    return name.includes(selectedCategory)
  }), [menus, selectedCategory])

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl bg-aldesRed p-8 text-white shadow-sm">
        <p className="text-2xl font-black sm:text-3xl">25% OFF FOR NEW CUSTOMERS!</p>
        <p className="mt-2 text-sm sm:text-base">Use code: ALDES25</p>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-extrabold text-aldesRed">OUR BURGER MENU</h2>
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${selectedCategory === category.id ? 'bg-aldesRed text-white' : 'bg-white text-aldesRed shadow-sm'}`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {isFetching ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => <MenuCardSkeleton key={index} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {filteredMenus.map((item) => {
              const isLoading = activeActionId === item.id

              return (
                <article
                  key={item.id}
                  className={`overflow-hidden rounded-3xl bg-white shadow-sm ${
                    item.is_custom ? 'border-2 border-aldesYellow' : 'border border-transparent'
                  }`}
                >
                  <div className="h-40 bg-aldesCream" />
                  <div className="p-4">
                    <div className={`mb-3 inline-flex items-center gap-1 rounded-2xl px-2 py-1 text-xs font-bold ${item.is_custom ? 'bg-aldesYellow text-black' : 'bg-aldesCream text-aldesRed'}`}>
                      {item.is_custom ? <><Flame className="h-3.5 w-3.5" /> Hot Feature</> : 'Signature Menu'}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                    <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                    {!item.is_custom && <p className="mt-3 text-base font-semibold text-aldesRed">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price ?? 0)}</p>}
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={item.is_custom ? () => navigate('/kitchen', { state: { menuId: item.id } }) : () => addSimpleItem(item)}
                      className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2 font-semibold transition ${isLoading ? 'cursor-not-allowed opacity-70' : ''} ${
                        item.is_custom
                          ? 'bg-aldesYellow text-black hover:brightness-95'
                          : 'bg-aldesRed text-white hover:brightness-110'
                      }`}
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {item.is_custom ? 'Start Building ->' : 'Add +'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

export default Menus

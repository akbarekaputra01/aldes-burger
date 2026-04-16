import { Flame, Sandwich, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const menuItems = [
  {
    id: 1,
    category: 'Burgers',
    name: 'Beef Burger - Double Patty',
    desc: 'Premium beef, cheddar cheese, and house special sauce.',
    price: 55000,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    category: 'Burgers',
    name: 'Spicy Crispy Chicken Burger',
    desc: 'Crispy spicy chicken, lettuce, and creamy mayo.',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    category: 'Burgers',
    name: 'DIY Burger (The Burger Lab)',
    desc: 'Build your burger from scratch exactly how you like it.',
    price: 40000,
    image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    category: 'Drinks',
    name: 'Cola Float',
    desc: 'Classic cola with creamy vanilla float.',
    price: 18000,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 5,
    category: 'Snacks',
    name: 'Crispy Onion Rings',
    desc: 'Golden ring snack with smoky dipping sauce.',
    price: 28000,
    image: 'https://images.unsplash.com/photo-1555072956-7758afb20e8f?auto=format&fit=crop&w=900&q=80',
  },
]

const categories = ['All', 'Burgers', 'Drinks', 'Snacks']

const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)

function Menus() {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [activeFilter, setActiveFilter] = useState('All')

  const filteredItems = useMemo(
    () => (activeFilter === 'All' ? menuItems : menuItems.filter((item) => item.category === activeFilter)),
    [activeFilter],
  )

  const quickAdd = (item) => addToCart({ id: item.id, name: item.name, price: item.price, qty: 1 })

  return (
    <main className="bg-aldesCream px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-7xl">
        <header className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <p className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            <Sparkles className="h-4 w-4" /> Curated presets & custom kitchen
          </p>
          <h1 className="mt-3 text-3xl font-black text-gray-800 sm:text-4xl">The Burger Lab</h1>
          <p className="mt-2 max-w-2xl text-gray-600">Explore Our Presets, then jump into the kitchen to personalize every bite.</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveFilter(category)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeFilter === category ? 'bg-aldesRed text-white' : 'bg-aldesYellow/25 text-aldesRed hover:bg-aldesYellow/40'}`}
              >
                {category}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <img src={item.image} alt={item.name} className="h-48 w-full object-cover" />
              <div className="p-5">
                <p className="inline-flex items-center gap-1 rounded-full bg-aldesYellow/25 px-2.5 py-1 text-xs font-semibold text-aldesRed">
                  {item.category === 'Burgers' ? <Sandwich className="h-3.5 w-3.5" /> : <Flame className="h-3.5 w-3.5" />} {item.category}
                </p>
                <h2 className="mt-3 text-lg font-bold text-gray-800">{item.name}</h2>
                <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
                <p className="mt-3 text-base font-black text-aldesRed">{formatIDR(item.price)}</p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/kitchen')}
                    className="rounded-2xl bg-aldesRed px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                  >
                    Customize in Kitchen
                  </button>
                  <button
                    type="button"
                    onClick={() => quickAdd(item)}
                    className="rounded-2xl border border-aldesRed/30 px-3 py-2 text-sm font-semibold text-aldesRed transition hover:bg-aldesYellow/25"
                  >
                    Add +
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Menus

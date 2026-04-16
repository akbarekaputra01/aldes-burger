import { Flame } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function Menus() {
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const burgerMenu = [
    {
      id: 1,
      name: 'Beef Burger - Double Patty',
      desc: 'Premium beef, cheddar cheese, and house special sauce.',
      priceLabel: 'Rp 55.000',
      price: 55000,
      isCustom: false,
    },
    {
      id: 2,
      name: 'Spicy Crispy Chicken Burger',
      desc: 'Crispy spicy chicken, lettuce, and creamy mayo.',
      priceLabel: 'Rp 45.000',
      price: 45000,
      isCustom: false,
    },
    {
      id: 3,
      name: 'Make Your Own Burger',
      desc: 'Build your burger from scratch exactly how you like it.',
      priceLabel: '',
      price: 0,
      isCustom: true,
    },
  ]

  const sideDishes = [
    { id: 4, name: 'French Fries', priceLabel: 'Rp 25.000', price: 25000 },
    { id: 5, name: 'Nuggets', priceLabel: 'Rp 30.000', price: 30000 },
    { id: 6, name: 'Onion Rings', priceLabel: 'Rp 28.000', price: 28000 },
  ]

  const drinks = [
    { id: 7, name: 'Soft Drink', priceLabel: 'Rp 15.000', price: 15000 },
    { id: 8, name: 'Tea', priceLabel: 'Rp 12.000', price: 12000 },
    { id: 9, name: 'Water', priceLabel: 'Rp 10.000', price: 10000 },
  ]

  const addSimpleItem = (item) => {
    addToCart({ id: item.id, name: item.name, price: item.price, qty: 1 })
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-2xl bg-gray-900 p-8 text-white shadow-md">
        <p className="text-2xl font-black sm:text-3xl">25% OFF FOR NEW CUSTOMERS!</p>
        <p className="mt-2 text-sm sm:text-base">Use code: ALDES25</p>
        <div className="mt-6 flex justify-center gap-2">
          {[0, 1, 2].map((dot) => (
            <span key={dot} className={`h-2.5 w-2.5 rounded-xl ${dot === 0 ? 'bg-aldesYellow' : 'bg-white/40'}`} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-extrabold text-aldesRed">OUR BURGER MENU</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {burgerMenu.map((item) => (
            <article
              key={item.id}
              className={`overflow-hidden rounded-xl bg-white shadow-md ${
                item.isCustom ? 'border-2 border-aldesYellow' : 'border border-transparent'
              }`}
            >
              <div className="h-40 bg-gray-200" />
              <div className="p-4">
                {item.isCustom && (
                  <div className="mb-3 inline-flex items-center gap-1 rounded-xl bg-aldesYellow px-2 py-1 text-xs font-bold text-black">
                    <Flame className="h-3.5 w-3.5" /> Hot Feature
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
                {!item.isCustom && <p className="mt-3 text-base font-semibold text-aldesRed">{item.priceLabel}</p>}
                <button
                  type="button"
                  onClick={item.isCustom ? () => navigate('/kitchen') : () => addSimpleItem(item)}
                  className={`mt-4 w-full rounded-xl px-4 py-2 font-semibold transition ${
                    item.isCustom
                      ? 'bg-aldesYellow text-black hover:brightness-95'
                      : 'bg-aldesRed text-white hover:brightness-110'
                  }`}
                >
                  {item.isCustom ? 'Start Building ->' : 'Add +'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-extrabold text-aldesRed">SIDE DISHES & SNACKS</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {sideDishes.map((item) => (
            <article key={item.id} className="rounded-xl bg-white p-3 shadow-md">
              <div className="h-28 rounded-xl bg-gray-200" />
              <h3 className="mt-3 font-bold text-gray-900">{item.name}</h3>
              <p className="mt-1 text-sm font-semibold text-aldesRed">{item.priceLabel}</p>
              <button
                type="button"
                onClick={() => addSimpleItem(item)}
                className="mt-3 w-full rounded-xl bg-aldesRed px-3 py-2 font-semibold text-white transition hover:brightness-110"
              >
                Add +
              </button>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-extrabold text-aldesRed">FRESH DRINKS</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {drinks.map((item) => (
            <article key={item.id} className="rounded-xl bg-white p-3 shadow-md">
              <div className="h-28 rounded-xl bg-gray-200" />
              <h3 className="mt-3 font-bold text-gray-900">{item.name}</h3>
              <p className="mt-1 text-sm font-semibold text-aldesRed">{item.priceLabel}</p>
              <button
                type="button"
                onClick={() => addSimpleItem(item)}
                className="mt-3 w-full rounded-xl bg-aldesRed px-3 py-2 font-semibold text-white transition hover:brightness-110"
              >
                Add +
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Menus

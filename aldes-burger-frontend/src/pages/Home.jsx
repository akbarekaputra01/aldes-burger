import { Flame, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function Home() {
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
      <section className="relative overflow-hidden rounded-3xl border border-aldesYellow/40 bg-gradient-to-br from-aldesRed via-[#b91f15] to-[#8f190f] p-8 text-white shadow-xl">
        <div className="absolute -right-6 -top-8 h-32 w-32 rounded-full bg-aldesYellow/25 blur-2xl" />
        <div className="absolute -bottom-10 left-10 h-40 w-40 rounded-full bg-aldesYellow/10 blur-3xl" />

        <div className="relative z-10 max-w-xl">
          <p className="inline-flex items-center gap-2 rounded-xl bg-aldesYellow/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-black">
            <Sparkles className="h-3.5 w-3.5" />
            Promo Minggu Ini
          </p>
          <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">25% OFF FOR NEW CUSTOMERS!</h1>
          <p className="mt-3 text-sm text-white/90 sm:text-base">Use code ALDES25 saat checkout dan nikmati burger favoritmu.</p>
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="mt-6 rounded-xl bg-aldesYellow px-5 py-2.5 font-bold text-black transition hover:brightness-95"
          >
            Claim Promo
          </button>
        </div>

        <div className="relative z-10 mt-7 flex justify-center gap-2">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className={`h-2.5 w-8 rounded-xl transition ${dot === 0 ? 'bg-aldesYellow' : 'bg-white/30'}`}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-aldesRed">OUR BURGER MENU</h2>
          <p className="text-sm font-medium text-aldesRed/80">Pilihan signature & custom burger</p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {burgerMenu.map((item) => (
            <article
              key={item.id}
              className={`group overflow-hidden rounded-2xl border bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl ${
                item.isCustom ? 'border-aldesYellow' : 'border-aldesRed/10'
              }`}
            >
              <div className="relative h-40 bg-gradient-to-br from-aldesCream via-white to-aldesYellow/35">
                <div className="absolute inset-0 m-auto h-20 w-20 rounded-full bg-aldesRed/10 blur-xl" />
              </div>
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
            <article key={item.id} className="rounded-2xl border border-aldesRed/10 bg-white p-3 shadow-md transition hover:shadow-lg">
              <div className="h-28 rounded-xl bg-gradient-to-br from-aldesCream to-aldesYellow/35" />
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
            <article key={item.id} className="rounded-2xl border border-aldesRed/10 bg-white p-3 shadow-md transition hover:shadow-lg">
              <div className="h-28 rounded-xl bg-gradient-to-br from-aldesCream to-aldesYellow/35" />
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

export default Home

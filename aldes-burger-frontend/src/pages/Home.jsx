import { ArrowRight, Flame, Sparkles, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/useCart'

const burgerMenu = [
  {
    id: 1,
    name: 'Beef Burger - Double Patty',
    desc: 'Premium beef, cheddar melt, caramelized onion, dan house special sauce.',
    priceLabel: 'Rp 55.000',
    price: 55000,
    isCustom: false,
  },
  {
    id: 2,
    name: 'Spicy Crispy Chicken Burger',
    desc: 'Crispy chicken, lettuce segar, smoked chili mayo, dan pickled slaw.',
    priceLabel: 'Rp 45.000',
    price: 45000,
    isCustom: false,
  },
  {
    id: 3,
    name: 'Make Your Own Burger',
    desc: 'Bebas pilih bahan, saus, level crunchy, sampai extra patty sesukamu.',
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
  { id: 8, name: 'Iced Tea', priceLabel: 'Rp 12.000', price: 12000 },
  { id: 9, name: 'Mineral Water', priceLabel: 'Rp 10.000', price: 10000 },
]

function Home() {
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const addSimpleItem = (item) => {
    addToCart({ id: item.id, name: item.name, price: item.price, qty: 1 })
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-aldesRed/15 bg-gradient-to-br from-aldesRed via-[#bb251b] to-[#8e1b13] p-7 text-white shadow-2xl md:p-10">
        <div className="absolute -right-14 -top-16 h-44 w-44 rounded-full bg-aldesYellow/30 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 h-20 w-40 rounded-full bg-white/15 blur-3xl" />

        <div className="relative z-10 grid items-end gap-8 md:grid-cols-2">
          <div>
            <p className="pill border-white/30 bg-white/20 text-white">
              <Sparkles className="h-3.5 w-3.5" /> Limited Offer
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">Redesign taste, redesign experience.</h1>
            <p className="mt-3 max-w-xl text-sm text-white/90 md:text-base">
              Nikmati experience Aldes Burger yang lebih fresh, cepat, dan interaktif — dari pilih menu sampai checkout.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => navigate('/kitchen')} className="rounded-2xl bg-aldesYellow px-5 py-3 font-black text-aldesRed transition hover:brightness-95">
                Build Custom Burger
              </button>
              <button type="button" onClick={() => navigate('/cart')} className="rounded-2xl border border-white/40 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20">
                Checkout Now
              </button>
            </div>
          </div>

          <div className="glass-card float-soft border-none bg-white/15 p-6 text-white shadow-none backdrop-blur-sm">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/75">Today Highlights</p>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-white/90">
                  <Star className="h-4 w-4 text-aldesYellow" /> Top Rated
                </span>
                <span className="text-sm font-black">4.9/5</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-white/90">
                  <Flame className="h-4 w-4 text-aldesYellow" /> Express Ready
                </span>
                <span className="text-sm font-black">12-18 min</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-white/90">
                  <ArrowRight className="h-4 w-4 text-aldesYellow" /> Repeat Orders
                </span>
                <span className="text-sm font-black">87%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-card p-5 md:p-7">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <h2 className="section-title">Burger Signature</h2>
          <span className="pill">best seller lineup</span>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {burgerMenu.map((item) => (
            <article key={item.id} className="group rounded-3xl border border-aldesRed/10 bg-white p-4 shadow-md transition duration-300 hover:-translate-y-1.5 hover:shadow-xl">
              <div className="pulse-glow h-40 rounded-2xl bg-gradient-to-br from-aldesCream via-white to-aldesYellow/45" />
              {item.isCustom && (
                <p className="mt-4 inline-flex items-center gap-1 rounded-full bg-aldesYellow/70 px-2.5 py-1 text-xs font-bold text-aldesRed">
                  <Flame className="h-3 w-3" /> Interactive Builder
                </p>
              )}
              <h3 className="mt-3 text-lg font-black text-slate-900">{item.name}</h3>
              <p className="mt-2 min-h-11 text-sm text-slate-600">{item.desc}</p>
              {!item.isCustom && <p className="mt-3 text-base font-black text-aldesRed">{item.priceLabel}</p>}
              <button
                type="button"
                onClick={item.isCustom ? () => navigate('/kitchen') : () => addSimpleItem(item)}
                className={`mt-4 w-full rounded-2xl px-4 py-2.5 font-bold transition ${
                  item.isCustom ? 'bg-aldesYellow text-aldesRed hover:brightness-95' : 'bg-aldesRed text-white hover:brightness-110'
                }`}
              >
                {item.isCustom ? 'Start Building' : 'Add To Cart'}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <div className="glass-card p-5 md:p-6">
          <h3 className="text-xl font-black text-aldesRed">Side Dishes</h3>
          <div className="mt-4 space-y-3">
            {sideDishes.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => addSimpleItem(item)}
                className="flex w-full items-center justify-between rounded-2xl border border-aldesRed/10 bg-white px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-aldesRed/30"
              >
                <span>
                  <p className="font-bold text-slate-900">{item.name}</p>
                  <p className="text-sm font-semibold text-aldesRed">{item.priceLabel}</p>
                </span>
                <span className="rounded-xl bg-aldesYellow/70 px-3 py-1 text-xs font-black text-aldesRed">ADD</span>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-5 md:p-6">
          <h3 className="text-xl font-black text-aldesRed">Fresh Drinks</h3>
          <div className="mt-4 space-y-3">
            {drinks.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => addSimpleItem(item)}
                className="flex w-full items-center justify-between rounded-2xl border border-aldesRed/10 bg-white px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-aldesRed/30"
              >
                <span>
                  <p className="font-bold text-slate-900">{item.name}</p>
                  <p className="text-sm font-semibold text-aldesRed">{item.priceLabel}</p>
                </span>
                <span className="rounded-xl bg-aldesRed px-3 py-1 text-xs font-black text-white">ADD</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home

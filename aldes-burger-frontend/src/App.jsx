import { useState } from 'react'
import { FileText, Flame, ShoppingCart, User } from 'lucide-react'

function App() {
  const [cartCount, setCartCount] = useState(0)
  const [activePromo] = useState(0)

  const burgerMenu = [
    { id: 1, name: 'Beef Burger - Double Patty', desc: 'Daging Sapi Pilihan, Keju, Saus Spesial', price: 'Rp 55.000', isCustom: false },
    { id: 2, name: 'Spicy Crispy Chicken Burger', desc: 'Ayam Krispi Pedas, Selada, Mayo', price: 'Rp 45.000', isCustom: false },
    { id: 3, name: 'Make Your Own Burger', desc: '*Blank, menyesuaikan. Rakit burger sesuai seleramu!', price: '', isCustom: true },
  ]

  const sideDishes = [
    { id: 4, name: 'French Fries', price: 'Rp 25.000' },
    { id: 5, name: 'Nugget', price: 'Rp 30.000' },
    { id: 6, name: 'Onion Ring', price: 'Rp 28.000' },
  ]

  const drinks = [
    { id: 7, name: 'Soft Drink', price: 'Rp 15.000' },
    { id: 8, name: 'Tea', price: 'Rp 12.000' },
    { id: 9, name: 'Water', price: 'Rp 10.000' },
  ]

  const addToCart = () => setCartCount((prev) => prev + 1)

  return (
    <div className="min-h-screen bg-aldesCream">
      <header className="sticky top-0 z-50 bg-aldesRed text-white shadow-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <h1 className="text-xl font-extrabold tracking-wide">Aldes Burger</h1>
          <div className="flex items-center gap-5">
            <button className="rounded-xl p-2 transition hover:bg-white/10" aria-label="Transactions">
              <FileText className="h-6 w-6" />
            </button>
            <button className="relative rounded-xl p-2 transition hover:bg-white/10" aria-label="Cart">
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -right-1 -top-1 rounded-xl bg-aldesYellow px-1.5 text-xs font-bold text-black">
                {cartCount}
              </span>
            </button>
            <button className="rounded-xl p-2 transition hover:bg-white/10" aria-label="Profile">
              <User className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-2xl bg-gray-900 p-8 text-white shadow-md">
          <p className="text-2xl font-black sm:text-3xl">DISKON 25% UNTUK PELANGGAN BARU!</p>
          <p className="mt-2 text-sm sm:text-base">Gunakan kode: ALDES25</p>
          <div className="mt-6 flex justify-center gap-2">
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className={`h-2.5 w-2.5 rounded-xl ${activePromo === dot ? 'bg-aldesYellow' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-extrabold text-aldesRed">MENU BURGER KAMI</h2>
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
                  {!item.isCustom && <p className="mt-3 text-base font-semibold text-aldesRed">{item.price}</p>}
                  <button
                    onClick={!item.isCustom ? addToCart : undefined}
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
          <h2 className="mb-4 text-2xl font-extrabold text-aldesRed">SIDE DISH & CAMILAN</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {sideDishes.map((item) => (
              <article key={item.id} className="rounded-xl bg-white p-3 shadow-md">
                <div className="h-28 rounded-xl bg-gray-200" />
                <h3 className="mt-3 font-bold text-gray-900">{item.name}</h3>
                <p className="mt-1 text-sm font-semibold text-aldesRed">{item.price}</p>
                <button
                  onClick={addToCart}
                  className="mt-3 w-full rounded-xl bg-aldesRed px-3 py-2 font-semibold text-white transition hover:brightness-110"
                >
                  Add +
                </button>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-extrabold text-aldesRed">MINUMAN SEGAR</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {drinks.map((item) => (
              <article key={item.id} className="rounded-xl bg-white p-3 shadow-md">
                <div className="h-28 rounded-xl bg-gray-200" />
                <h3 className="mt-3 font-bold text-gray-900">{item.name}</h3>
                <p className="mt-1 text-sm font-semibold text-aldesRed">{item.price}</p>
                <button
                  onClick={addToCart}
                  className="mt-3 w-full rounded-xl bg-aldesRed px-3 py-2 font-semibold text-white transition hover:brightness-110"
                >
                  Add +
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-12 bg-aldesRed p-8 text-white">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <h4 className="mb-3 text-lg font-bold">Tautan Menu</h4>
            <ul className="space-y-2 text-sm">
              <li>Pesan Sekarang</li>
              <li>Buat Burgermu</li>
              <li>Akun Saya</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-lg font-bold">Informasi</h4>
            <ul className="space-y-2 text-sm">
              <li>Kontak</li>
              <li>Syarat &amp; Ketentuan</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-lg font-bold">Social Media</h4>
            <ul className="space-y-2 text-sm">
              <li>Instagram</li>
              <li>Facebook</li>
              <li>TikTok</li>
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-8 w-full max-w-7xl text-center text-sm">© 2026 Aldes Burger. All Rights Reserved.</p>
      </footer>
    </div>
  )
}

export default App

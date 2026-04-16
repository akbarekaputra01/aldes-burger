import { MapPin, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/useCart'

function Cart() {
  const navigate = useNavigate()
  const contextValue = useCart()

  const fallbackCart = [
    {
      id: 'fallback-1',
      name: 'Beef Burger - Double Patty',
      price: 55000,
      qty: 1,
      modifiers: ['Double cheddar', 'Extra pickles', 'No onions'],
    },
  ]

  const cart = contextValue?.cart ?? fallbackCart
  const removeFromCart = contextValue?.removeFromCart ?? (() => {})
  const updateQty = contextValue?.updateQty
  const clearCart = contextValue?.clearCart

  const toNumber = (value) => {
    if (typeof value === 'number') return value
    if (typeof value !== 'string') return 0

    return Number(value.replace(/[^\d]/g, '')) || 0
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount)

  const getItemPrice = (item) => toNumber(item.price ?? item.basePrice ?? item.totalPrice)

  const handleIncrease = (item) => {
    if (updateQty) {
      updateQty(item.id, (item.qty ?? 1) + 1)
    }
  }

  const handleDecrease = (item) => {
    const nextQty = (item.qty ?? 1) - 1
    if (nextQty <= 0) {
      removeFromCart(item.id)
      return
    }

    if (updateQty) {
      updateQty(item.id, nextQty)
      return
    }

    removeFromCart(item.id)
  }

  const handleCheckout = () => {
    if (clearCart) {
      clearCart()
    }
    navigate('/payment-status')
  }

  const isCartEmpty = !Array.isArray(cart) || cart.length === 0

  if (isCartEmpty) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="glass-card w-full p-8 text-center md:p-12">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-aldesYellow/70 text-aldesRed">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-2xl font-black text-aldesRed">Keranjang kamu masih kosong</h2>
          <p className="mt-2 text-slate-600">Yuk isi dengan menu favoritmu. Sekali klik, langsung siap checkout.</p>
          <button type="button" onClick={() => navigate('/')} className="btn-primary mt-6">
            Lihat Menu
          </button>
        </section>
      </main>
    )
  }

  const subtotal = cart.reduce((sum, item) => sum + getItemPrice(item) * (item.qty ?? 1), 0)
  const deliveryFee = 15000
  const platformFee = 3000
  const grandTotal = subtotal + deliveryFee + platformFee

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <div className="space-y-4">
          <article className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-aldesRed" />
                <h2 className="font-black text-slate-900">Delivery Address</h2>
              </div>
              <button type="button" className="text-sm font-bold text-aldesRed">
                Change
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-600">Jl. Sudirman No. 123, Jakarta • Note: pagar hitam, rumah pojok</p>
          </article>

          {cart.map((item) => (
            <article key={item.id} className="glass-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-slate-900">{item.name}</h3>
                  {Array.isArray(item.modifiers) && item.modifiers.length > 0 && <p className="mt-1 text-sm text-slate-600">{item.modifiers.join(', ')}</p>}
                  {Array.isArray(item.ingredients) && item.ingredients.length > 0 && <p className="mt-1 text-sm text-slate-600">{item.ingredients.join(', ')}</p>}
                  <p className="mt-3 font-black text-aldesRed">{formatCurrency(getItemPrice(item))}</p>
                </div>

                <button type="button" onClick={() => removeFromCart(item.id)} className="rounded-xl border border-red-200 p-2 text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button type="button" onClick={() => handleDecrease(item)} className="rounded-xl border border-aldesRed/30 bg-white p-2 text-aldesRed">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-8 text-center text-sm font-black">{item.qty ?? 1}</span>
                <button type="button" onClick={() => handleIncrease(item)} className="rounded-xl border border-aldesRed/30 bg-white p-2 text-aldesRed">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="glass-card h-fit p-5">
          <h2 className="text-lg font-black text-slate-900">Payment Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery</span>
              <span>{formatCurrency(deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Service Fee</span>
              <span>{formatCurrency(platformFee)}</span>
            </div>
          </div>
          <div className="my-4 border-t border-aldesRed/10" />
          <div className="flex items-center justify-between text-lg font-black text-aldesRed">
            <span>Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>

          <button type="button" onClick={handleCheckout} className="btn-primary mt-5 w-full">
            Bayar Sekarang
          </button>
        </aside>
      </section>
    </main>
  )
}

export default Cart

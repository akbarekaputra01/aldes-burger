import { useContext } from 'react'
import { MapPin, Minus, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CartContext } from '../context/CartContext'

function Cart() {
  const navigate = useNavigate()
  const contextValue = CartContext ? useContext(CartContext) : null

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
      return
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
    alert('Redirecting to Payment Gateway...')
  }

  const isCartEmpty = !Array.isArray(cart) || cart.length === 0

  if (isCartEmpty) {
    return (
      <main className="min-h-screen bg-aldesCream px-4 py-8 pb-32">
        <section className="mx-auto max-w-3xl rounded-2xl border border-aldesRed/10 bg-white p-8 text-center shadow">
          <h2 className="text-2xl font-bold text-aldesRed">Your cart is empty</h2>
          <p className="mt-2 text-gray-600">Looks like you have not added any items yet.</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-6 rounded-xl bg-aldesRed px-6 py-3 font-semibold text-white transition hover:brightness-110"
          >
            Browse Menu
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
    <main className="min-h-screen bg-aldesCream px-4 py-6 pb-32">
      <div className="mx-auto w-full max-w-4xl">
        <section className="mb-6 rounded-2xl border border-aldesRed/10 bg-white p-4 shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-aldesRed" />
              <h2 className="font-bold text-gray-900">Delivery Address</h2>
            </div>
            <button type="button" className="text-sm font-semibold text-aldesRed">
              Change
            </button>
          </div>
          <p className="mt-3 text-sm text-gray-600">Jl. Sudirman No. 123, Jakarta</p>
        </section>

        <section className="mb-6 space-y-4">
          {cart.map((item) => (
            <article key={item.id} className="flex items-start justify-between gap-4 rounded-2xl border border-aldesRed/10 bg-white p-4 shadow">
              <div>
                <h3 className="text-base font-bold text-gray-900">{item.name}</h3>
                {Array.isArray(item.modifiers) && item.modifiers.length > 0 && (
                  <p className="mt-1 text-sm text-gray-600">Contains: {item.modifiers.join(', ')}</p>
                )}
                {Array.isArray(item.ingredients) && item.ingredients.length > 0 && (
                  <p className="mt-1 text-sm text-gray-600">Contains: {item.ingredients.join(', ')}</p>
                )}
                <p className="mt-3 text-sm font-semibold text-aldesRed">{formatCurrency(getItemPrice(item))}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDecrease(item)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-aldesRed text-aldesRed"
                  aria-label={`Decrease quantity for ${item.name}`}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center text-sm font-bold text-gray-800">{item.qty ?? 1}</span>
                <button
                  type="button"
                  onClick={() => handleIncrease(item)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-aldesRed text-aldesRed"
                  aria-label={`Increase quantity for ${item.name}`}
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                  className="ml-2 text-aldesRed"
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </article>
          ))}
        </section>

        <section className="mb-6 rounded-2xl border border-aldesRed/10 bg-white p-4 shadow">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Payment Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Delivery Fee</span>
              <span>{formatCurrency(deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Platform Fee</span>
              <span>{formatCurrency(platformFee)}</span>
            </div>
          </div>
          <div className="my-3 border-t border-gray-200" />
          <div className="flex justify-between text-base font-bold text-gray-900">
            <span>Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </section>
      </div>

      <section className="fixed bottom-0 left-0 z-40 w-full border-t border-aldesRed/10 bg-white/95 p-4 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.1)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Payment</p>
            <p className="text-lg font-bold text-aldesRed">{formatCurrency(grandTotal)}</p>
          </div>
          <button
            type="button"
            onClick={handleCheckout}
            className="rounded-xl bg-aldesRed px-8 py-3 font-bold text-white transition hover:brightness-110"
          >
            Checkout
          </button>
        </div>
      </section>
    </main>
  )
}

export default Cart

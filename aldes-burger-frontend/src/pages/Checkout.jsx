import { Banknote, Building2, CircleDollarSign, CreditCard, Loader2, MapPin } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import api from '../lib/api'

const paymentOptions = [
  { id: 'cash', label: 'Cash', icon: Banknote },
  { id: 'gopay', label: 'Gopay', icon: CircleDollarSign },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: Building2 },
]

const toIDR = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)

function Checkout() {
  const navigate = useNavigate()
  const { cart, clearCart } = useCart()
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [selectedPaymentId, setSelectedPaymentId] = useState(paymentOptions[0].id)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  useEffect(() => {
    const loadAddresses = async () => {
      const { data } = await api.get('/addresses')
      setAddresses(data)
      setSelectedAddressId(data[0]?.id ?? null)
    }

    loadAddresses().catch(() => setAddresses([]))
  }, [])

  const checkoutItems = cart

  const summary = useMemo(() => {
    const base = checkoutItems.reduce((total, item) => total + (item.basePrice ?? item.price) * item.qty, 0)
    const modifierAdditions = checkoutItems.reduce(
      (total, item) => total + (item.modifiers ?? []).filter((mod) => mod.action === 'add').reduce((sum, mod) => sum + (mod.price ?? 0), 0) * item.qty,
      0,
    )

    return { base, modifierAdditions, total: base + modifierAdditions }
  }, [checkoutItems])

  const placeOrder = async () => {
    setIsPlacingOrder(true)
    const payload = {
      address_id: selectedAddressId,
      payment_method: selectedPaymentId,
      items: checkoutItems.map((item) => ({
        menu_id: item.menu_id,
        quantity: item.qty,
        modifiers: (item.modifiers ?? []).map((modifier) => ({ ingredient_id: modifier.ingredient_id, action: modifier.action })),
      })),
    }

    try {
      const { data } = await api.post('/checkout', payload)
      clearCart()
      navigate(`/transactions/${data.id}`)
    } finally {
      setIsPlacingOrder(false)
    }
  }

  return (
    <main className="min-h-screen bg-aldesCream px-4 py-6">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">
          <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-800"><MapPin className="h-5 w-5 text-aldesRed" />Select Address</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {addresses.map((address) => (
                <button
                  key={address.id}
                  type="button"
                  onClick={() => setSelectedAddressId(address.id)}
                  className={`rounded-2xl border p-4 text-left transition ${selectedAddressId === address.id ? 'border-aldesRed bg-aldesCream' : 'border-gray-200 hover:border-aldesYellow'}`}
                >
                  <p className="font-semibold text-gray-800">Address #{address.id}</p>
                  <p className="mt-1 text-sm text-gray-600">{address.address}</p>
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-800"><CreditCard className="h-5 w-5 text-aldesRed" />Payment Method</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {paymentOptions.map((payment) => {
                const Icon = payment.icon
                return (
                  <button
                    key={payment.id}
                    type="button"
                    onClick={() => setSelectedPaymentId(payment.id)}
                    className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition ${selectedPaymentId === payment.id ? 'border-aldesRed bg-aldesCream text-aldesRed' : 'border-gray-200 text-gray-700 hover:border-aldesYellow'}`}
                  >
                    <Icon className="h-4 w-4" />
                    {payment.label}
                  </button>
                )
              })}
            </div>
          </article>
        </section>

        <aside className="rounded-3xl bg-white p-5 shadow-md sm:p-6">
          <h2 className="text-xl font-bold text-gray-800">Order Summary</h2>
          <div className="mt-4 space-y-4">
            {checkoutItems.map((item) => (
              <div key={item.id} className="rounded-2xl bg-aldesCream p-4">
                <p className="font-semibold text-gray-800">{item.qty}x {item.name}</p>
                <p className="text-sm text-gray-600">Base: {toIDR(item.basePrice ?? item.price)}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2 border-t border-gray-200 pt-4 text-sm">
            <p className="flex justify-between text-gray-700"><span>Base Price</span><span>{toIDR(summary.base)}</span></p>
            <p className="flex justify-between text-gray-700"><span>Modifier Additions</span><span>{toIDR(summary.modifierAdditions)}</span></p>
            <p className="flex justify-between text-base font-bold text-gray-900"><span>Total</span><span>{toIDR(summary.total)}</span></p>
          </div>

          <button type="button" disabled={isPlacingOrder} onClick={placeOrder} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-aldesRed px-4 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70">
            {isPlacingOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Place Order
          </button>
        </aside>
      </div>
    </main>
  )
}

export default Checkout

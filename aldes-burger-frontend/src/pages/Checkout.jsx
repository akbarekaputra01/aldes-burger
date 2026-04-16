import { Banknote, Building2, CircleDollarSign, CreditCard, MapPin } from 'lucide-react'
import { useMemo, useState } from 'react'

const addressOptions = [
  { id: 'home', label: 'Home', detail: 'Jl. Sudirman No. 123, Jakarta' },
  { id: 'office', label: 'Office', detail: 'Wisma Aldes, Lt. 12, Kuningan, Jakarta' },
  { id: 'parents', label: 'Parents', detail: 'Jl. Merdeka No. 8, Bandung' },
]

const paymentOptions = [
  { id: 'cash', label: 'Cash', icon: Banknote },
  { id: 'gopay', label: 'Gopay', icon: CircleDollarSign },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: Building2 },
]

const checkoutItems = [
  {
    id: 'itm-1',
    name: 'Double Beef Burger',
    qty: 1,
    basePrice: 55000,
    modifiers: [
      { type: 'ADD', name: 'Extra Cheese', price: 5000 },
      { type: 'REMOVE', name: 'Tomato', price: 0 },
    ],
  },
  {
    id: 'itm-2',
    name: 'Crispy Chicken Burger',
    qty: 2,
    basePrice: 45000,
    modifiers: [{ type: 'REMOVE', name: 'Onion', price: 0 }],
  },
]

const toIDR = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)

function Checkout() {
  const [selectedAddressId, setSelectedAddressId] = useState(addressOptions[0].id)
  const [selectedPaymentId, setSelectedPaymentId] = useState(paymentOptions[0].id)

  const summary = useMemo(() => {
    const base = checkoutItems.reduce((total, item) => total + item.basePrice * item.qty, 0)
    const modifierAdditions = checkoutItems.reduce(
      (total, item) => total + item.modifiers.filter((mod) => mod.type === 'ADD').reduce((sum, mod) => sum + mod.price, 0) * item.qty,
      0,
    )

    return {
      base,
      modifierAdditions,
      total: base + modifierAdditions,
    }
  }, [])

  return (
    <main className="min-h-screen bg-orange-50 px-4 py-6">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">
          <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-800"><MapPin className="h-5 w-5 text-orange-500" />Select Address</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {addressOptions.map((address) => (
                <button
                  key={address.id}
                  type="button"
                  onClick={() => setSelectedAddressId(address.id)}
                  className={`rounded-2xl border p-4 text-left transition ${selectedAddressId === address.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}
                >
                  <p className="font-semibold text-gray-800">{address.label}</p>
                  <p className="mt-1 text-sm text-gray-600">{address.detail}</p>
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-800"><CreditCard className="h-5 w-5 text-orange-500" />Payment Method</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {paymentOptions.map((payment) => {
                const Icon = payment.icon
                return (
                  <button
                    key={payment.id}
                    type="button"
                    onClick={() => setSelectedPaymentId(payment.id)}
                    className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition ${selectedPaymentId === payment.id ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-700 hover:border-orange-300'}`}
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
              <div key={item.id} className="rounded-2xl bg-orange-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-800">{item.qty}x {item.name}</p>
                    <p className="text-sm text-gray-600">Base: {toIDR(item.basePrice)}</p>
                  </div>
                </div>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  {item.modifiers.map((mod) => (
                    <li key={`${item.id}-${mod.name}`} className="flex items-center justify-between">
                      <span>{mod.type === 'ADD' ? `Extra ${mod.name.replace('Extra ', '')}` : `No ${mod.name}`}</span>
                      <span>{mod.price > 0 ? `+ ${toIDR(mod.price)}` : '-'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2 border-t border-gray-200 pt-4 text-sm">
            <p className="flex justify-between text-gray-700"><span>Base Price</span><span>{toIDR(summary.base)}</span></p>
            <p className="flex justify-between text-gray-700"><span>Modifier Additions</span><span>{toIDR(summary.modifierAdditions)}</span></p>
            <p className="flex justify-between text-base font-bold text-gray-900"><span>Total</span><span>{toIDR(summary.total)}</span></p>
          </div>

          <button type="button" className="mt-5 w-full rounded-2xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600">
            Place Order
          </button>
        </aside>
      </div>
    </main>
  )
}

export default Checkout

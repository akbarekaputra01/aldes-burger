import React from 'react'
import { MapPin, Minus, Plus, Trash2, X, Ticket } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

import imgBeefPatty from '../assets/beef_patty.png'
import imgBottomBurger from '../assets/bottom_burger.png'
import imgCheese from '../assets/cheese.png'
import imgChickenPatty from '../assets/chicken_patty.png'
import imgLettuce from '../assets/lettuce.png'
import imgPickles from '../assets/pickles.png'
import imgTomato from '../assets/tomato.png'
import imgTopBurger from '../assets/top_burger.png'

const getIngredientImage = (name) => {
  if (!name) return null
  const n = name.toLowerCase()
  if (n.includes('bottom')) return imgBottomBurger
  if (n.includes('top')) return imgTopBurger
  if (n.includes('beef')) return imgBeefPatty
  if (n.includes('chicken')) return imgChickenPatty
  if (n.includes('cheese')) return imgCheese
  if (n.includes('lettuce')) return imgLettuce
  if (n.includes('pickle')) return imgPickles
  if (n.includes('tomato')) return imgTomato
  return null
}

const getIngredientThickness = (name) => {
  if (!name) return 8
  const n = name.toLowerCase()
  if (n.includes('bottom')) return 2
  if (n.includes('top')) return 12
  if (n.includes('beef') || n.includes('chicken')) return 10
  if (n.includes('cheese') || n.includes('lettuce')) return 2
  return 4
}

const getVisualOffset = (name) => {
  const n = name.toLowerCase()
  if (n.includes('beef') || n.includes('chicken')) return 10
  return 0
}

const BurgerMiniPreview = ({ ingredients = [] }) => {
  let currentBottom = 4
  
  return (
    <div className="relative w-24 h-28 bg-aldesCream/50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center">
      <div className="absolute bottom-2 w-full flex justify-center items-end">
        {ingredients.map((name, index) => {
          const img = getIngredientImage(name)
          const thickness = getIngredientThickness(name)
          const pos = currentBottom
          currentBottom += thickness

          return (
            <div 
              key={index}
              className="absolute left-1/2 -translate-x-1/2 w-20"
              style={{ bottom: `${pos + getVisualOffset(name)}px`, zIndex: index }}
            >
              {img && (
                <img src={img} alt={name} className="w-full h-auto drop-shadow-sm" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Cart() {
  const navigate = useNavigate()
  const contextValue = useCart()

  const [addresses, setAddresses] = React.useState([
    { id: 1, label: 'Home', detail: '123 Sudirman Street, Jakarta', isSelected: true },
    { id: 2, label: 'Office', detail: 'Gandaria 8 Office Tower, South Jakarta', isSelected: false },
  ])
  const [isAddressModalOpen, setIsAddressModalOpen] = React.useState(false)
  const [isAddingNew, setIsAddingNew] = React.useState(false) // State untuk buka form input baru
  const [newAddr, setNewAddr] = React.useState({ label: '', detail: '' })

  const selectedAddress = addresses.find(a => a.isSelected) || addresses[0]

  const handleSelectAddress = (id) => {
    setAddresses(addresses.map(addr => ({ ...addr, isSelected: addr.id === id })))
    setIsAddressModalOpen(false)
  }

  const handleAddNewAddress = () => {
    if (!newAddr.label || !newAddr.detail) return alert("Please fill in all the required information!")
    const freshAddr = {
      id: Date.now(),
      label: newAddr.label,
      detail: newAddr.detail,
      isSelected: true
    }
    setAddresses(addresses.map(a => ({ ...a, isSelected: false })).concat(freshAddr))
    setNewAddr({ label: '', detail: '' })
    setIsAddingNew(false)
    setIsAddressModalOpen(false)
  }
  
  const cart = contextValue?.cart ?? []
  const removeFromCart = contextValue?.removeFromCart ?? (() => { })
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

  const getItemPrice = (item) => toNumber(item.unit_price ?? item.price ?? 0)

  const getIngredientNameById = (item, id) => {
    const list = item.ingredients || []
    const stringId = String(id)
    if (stringId === '1') return list.find(n => n.toLowerCase().includes('beef')) || 'Beef Patty'
    if (stringId === '2') return list.find(n => n.toLowerCase().includes('chicken')) || 'Chicken Patty'
    if (stringId === '3') return list.find(n => n.toLowerCase().includes('cheese')) || 'Cheese'
    if (stringId === '4') return list.find(n => n.toLowerCase().includes('pickle')) || 'Pickles'
    if (stringId === '5') return list.find(n => n.toLowerCase().includes('lettuce')) || 'Lettuce'
    if (stringId === '6') return list.find(n => n.toLowerCase().includes('tomato')) || 'Tomato'
    if (stringId === '7') return list.find(n => n.toLowerCase().includes('top')) || 'Top Bun'
    if (stringId === '8') return list.find(n => n.toLowerCase().includes('bottom')) || 'Bottom Bun'
    return `Item #${id}`
  }

  const handleIncrease = (item) => {
    if (updateQty) updateQty(item.id, (item.qty ?? 1) + 1)
  }

  const handleDecrease = (item) => {
    const nextQty = (item.qty ?? 1) - 1
    if (nextQty <= 0) {
      removeFromCart(item.id)
    } else if (updateQty) {
      updateQty(item.id, nextQty)
    }
  }

  const isCartEmpty = !Array.isArray(cart) || cart.length === 0

  if (isCartEmpty) {
    return (
      <main className="bg-aldesCream min-h-screen pb-32 px-4 py-8">
        <section className="mx-auto max-w-3xl rounded-xl bg-white p-8 text-center shadow">
          <h2 className="text-2xl font-bold text-aldesRed">Your cart is empty</h2>
          <p className="mt-2 text-gray-600">Looks like you have not added any items yet.</p>
          <button
            onClick={() => navigate('/menu')}
            className="mt-6 rounded-xl bg-aldesRed px-6 py-3 font-semibold text-white transition hover:brightness-110"
          >
            Browse Menu
          </button>
        </section>
      </main>
    )
  }

  const subtotal = cart.reduce((sum, item) => sum + getItemPrice(item) * (item.qty ?? 1), 0)
  const deliveryFee = 10000
  const platformFee = 3000
  const grandTotal = subtotal + deliveryFee + platformFee
  return (
    <main className="bg-aldesCream min-h-screen pb-40 px-4 py-6">
      <div className="mx-auto w-full max-w-4xl">
        
        {/* Address Section */}
        <section className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex items-center justify-between border-b border-gray-50">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-aldesRed" />
              <h2 className="font-bold text-gray-900">Delivery Address</h2>
            </div>
            <button 
              onClick={() => setIsAddressModalOpen(true)}
              className="text-sm font-semibold text-aldesRed hover:underline"
            >
              Change
            </button>
          </div>
          <div className="mt-3">
            <span className="text-[10px] bg-aldesRed/10 text-aldesRed px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              {selectedAddress.label}
            </span>
            <p className="mt-1 text-sm text-gray-600">{selectedAddress.detail}</p>
          </div>
        </section>

        {isAddressModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in duration-300">
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  {isAddingNew ? 'Tambah Alamat Baru' : 'Pilih Alamat Pengiriman'}
                </h3>
                <button onClick={() => { setIsAddingNew(false); setIsAddressModalOpen(false); }}>
                  <X className="h-6 w-6 text-gray-400" />
                </button>
              </div>

              {isAddingNew ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Label Alamat (Contoh: Kos, Kampus)</label>
                    <input 
                      type="text"
                      className="w-full mt-1 border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-aldesRed outline-none"
                      placeholder="Nama tempat..."
                      value={newAddr.label}
                      onChange={(e) => setNewAddr({...newAddr, label: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Alamat Lengkap</label>
                    <textarea 
                      className="w-full mt-1 border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-aldesRed outline-none resize-none"
                      rows="3"
                      placeholder="Nama jalan, nomor rumah..."
                      value={newAddr.detail}
                      onChange={(e) => setNewAddr({...newAddr, detail: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => setIsAddingNew(false)}
                      className="flex-1 py-3 font-bold text-gray-500 bg-gray-100 rounded-xl"
                    >
                      Batal
                    </button>
                    <button 
                      onClick={handleAddNewAddress}
                      className="flex-1 py-3 font-bold text-white bg-aldesRed rounded-xl shadow-lg shadow-red-100"
                    >
                      Simpan & Pakai
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                    {addresses.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => handleSelectAddress(item.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          item.isSelected ? 'border-aldesRed bg-red-50/30' : 'border-gray-100'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            item.isSelected ? 'bg-aldesRed text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {item.label}
                          </span>
                          {item.isSelected && <div className="w-2 h-2 rounded-full bg-aldesRed" />}
                        </div>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setIsAddingNew(true)}
                    className="w-full mt-6 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold text-sm hover:border-aldesRed hover:text-aldesRed transition-all"
                  >
                    + Tambah Alamat Baru
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Items Section */}
        <section className="mb-6">
          {cart.map((item) => (
            <article key={item.id} className="bg-white rounded-xl shadow p-4 mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <BurgerMiniPreview ingredients={item.ingredients} />
                
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-gray-900 truncate">{item.name}</h3>
                  {item.modifiers?.length > 0 && (
                    <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">
                      Mods: {item.modifiers.map(m => {
                        const name = m.ingredient_name || getIngredientNameById(item, m.ingredient_id);
                        return `${m.action} ${name}`;
                      }).join(', ')}
                    </p>
                  )}
                  <p className="mt-2 text-sm font-bold text-aldesRed">{formatCurrency(getItemPrice(item))}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-aldesCream/50 p-1 rounded-lg">
                  <button
                    onClick={() => handleDecrease(item)}
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-white border border-aldesRed text-aldesRed shadow-sm active:scale-90 transition-transform"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-5 text-center text-sm font-bold text-gray-800">{item.qty ?? 1}</span>
                  <button
                    onClick={() => handleIncrease(item)}
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-white border border-aldesRed text-aldesRed shadow-sm active:scale-90 transition-transform"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="ml-2 text-gray-400 hover:text-aldesRed transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </article>
          ))}

          {/* Add More Section */}
          <button 
            onClick={() => navigate('/menu')}
            className="w-full mt-2 py-2 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-500 text-[15px] font-bold flex items-center justify-center gap-2 hover:border-aldesRed hover:text-aldesRed transition-all active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Add more orders
          </button>
        </section>

        {/* Summary Section */}
        <section className="bg-white rounded-xl shadow p-4 mb-6">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Payment Summary</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-gray-900">{formatCurrency(deliveryFee)}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Fee</span>
              <span className="font-semibold text-gray-900">{formatCurrency(platformFee)}</span>
            </div>
          </div>
          <div className="my-4 border-t border-dashed border-gray-200" />
          <div className="flex justify-between text-base font-bold text-gray-900">
            <span>Total</span>
            <span className="text-aldesRed">{formatCurrency(grandTotal)}</span>
          </div>
        </section>
      </div>

      {/* Floating Checkout Bar */}
      <section className="fixed bottom-0 left-0 w-full bg-white shadow-[0_-8px_20px_rgba(0,0,0,0.05)] p-4 z-40 border-t border-gray-100">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Payment</p>
            <p className="text-xl font-black text-aldesRed">{formatCurrency(grandTotal)}</p>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="bg-aldesRed text-white px-10 py-3.5 rounded-2xl font-black text-lg shadow-lg shadow-red-100 hover:brightness-110 active:scale-95 transition-all"
          >
            Checkout
          </button>
        </div>
      </section>
    </main>
  )
}

export default Cart
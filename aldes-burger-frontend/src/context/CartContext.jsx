import { useMemo, useState } from 'react'
import { CartContext } from './cartContextObject'

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + (item.qty ?? 1), 0), [cart])

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id)
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, qty: cartItem.qty + (item.qty ?? 1) } : cartItem,
        )
      }

      return [...prev, { ...item, qty: item.qty ?? 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0),
    )
  }

  const updateQty = (id, qty) => {
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, qty: Math.max(1, qty) } : item)))
  }

  const clearCart = () => setCart([])

  const value = useMemo(
    () => ({ cart, cartCount, addToCart, removeFromCart, updateQty, clearCart }),
    [cart, cartCount],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const CART_STORAGE_KEY = 'aldes_cart'

const loadStoredCart = () => {
  const rawCart = localStorage.getItem(CART_STORAGE_KEY)
  if (!rawCart) return []

  try {
    const parsed = JSON.parse(rawCart)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadStoredCart)

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  }, [cart])

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart])

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
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQty = (id, qty) => {
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, qty: Math.max(1, qty) } : item)))
  }

  const clearCart = () => setCart([])

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
    }),
    [cart, cartCount],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

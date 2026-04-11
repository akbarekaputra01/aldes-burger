import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0)
    setCartCount(totalQty)
  }, [cart])

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

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      addToCart,
      removeFromCart,
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

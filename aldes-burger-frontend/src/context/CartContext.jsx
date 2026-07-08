import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)

// --- DYNAMIC STORAGE KEY RESOLUTION BASED ON USER IDENTIFIER ---
const getCartStorageKey = () => {
  try {
    const rawUser = localStorage.getItem('aldes_user')
    if (rawUser) {
      const user = JSON.parse(rawUser)
      if (user?.id) return `aldes_cart_user_${user.id}`
    }
  } catch (e) {
    console.error('Failed to resolve dynamic user storage key:', e)
  }
  return 'aldes_cart_guest'
}

const loadStoredCart = () => {
  const dynamicKey = getCartStorageKey()
  const rawCart = localStorage.getItem(dynamicKey)
  if (!rawCart) return []
  try {
    const parsed = JSON.parse(rawCart)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const normalizeModifierList = (modifiers) => {
  if (!Array.isArray(modifiers)) return []
  return modifiers
    .filter((modifier) => modifier?.ingredient_id && modifier?.action)
    .map((modifier) => ({
      ingredient_id: Number(modifier.ingredient_id),
      action: modifier.action,
      quantity: Math.max(1, Number(modifier.quantity ?? 1)),
    }))
}

const createItemKey = (item) => {
  if (!item.is_customized) {
    return `menu-${item.menu_id}`
  }

  const signature = {
    menu_id: item.menu_id,
    modifiers: item.modifiers,
    stack_order: item.stack_order,
    unit_price: item.unit_price,
  }
  return `custom-${item.menu_id}-${JSON.stringify(signature)}`
}

const normalizeCartItem = (inputItem) => {
  const qty = Math.max(1, Number(inputItem.qty ?? 1))
  const basePrice = Number(inputItem.base_price ?? inputItem.basePrice ?? 0)
  const unitPrice = Number(inputItem.unit_price ?? inputItem.price ?? basePrice)
  const modifiers = normalizeModifierList(inputItem.modifiers)
  const stackOrder = Array.isArray(inputItem.stack_order) ? inputItem.stack_order : []
  
  const isCustomized = Boolean(inputItem.is_customized ?? (modifiers.length > 0 || stackOrder.length > 0))

  const normalized = {
    menu_id: inputItem.menu_id || inputItem.id, 
    name: inputItem.name,
    qty,
    base_price: basePrice,
    unit_price: unitPrice,
    total_price: unitPrice * qty,
    modifiers,
    stack_order: stackOrder,
    ingredients: Array.isArray(inputItem.ingredients) ? inputItem.ingredients : [],
    reorder_only: Boolean(inputItem.reorder_only),
    is_customized: isCustomized,
  }

  normalized.id = createItemKey(normalized)
  return normalized
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadStoredCart)

  // Sync state mutation into the corresponding active dynamic key partition
  useEffect(() => {
    const dynamicKey = getCartStorageKey()
    localStorage.setItem(dynamicKey, JSON.stringify(cart))
  }, [cart])

  // Monitor framework or session level alterations (e.g., login, signup, logout context modifications)
  useEffect(() => {
    const handleSessionalRealignment = () => {
      setCart(loadStoredCart())
    }

    window.addEventListener('storage', handleSessionalRealignment)
    // Custom trigger event hook for local execution flows moving within identical single tab windows
    window.addEventListener('aldes_auth_sync', handleSessionalRealignment)

    return () => {
      window.removeEventListener('storage', handleSessionalRealignment)
      window.removeEventListener('aldes_auth_sync', handleSessionalRealignment)
    }
  }, [])

  const cartCount = useMemo(() => cart.length, [cart])

  const addToCart = (item) => {
    const normalized = normalizeCartItem(item)

    setCart((prev) => {
      const existingIndex = prev.findIndex((cartItem) => cartItem.id === normalized.id)

      if (existingIndex === -1) {
        return [...prev, normalized]
      }

      return prev.map((cartItem, idx) => {
        if (idx !== existingIndex) return cartItem
        const newQty = (cartItem.qty ?? 0) + normalized.qty
        return {
          ...cartItem,
          qty: newQty,
          total_price: cartItem.unit_price * newQty,
        }
      })
    })
  }

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQty = (id, qty) => {
    setCart((prev) => prev.map((item) => {
      if (item.id !== id) return item
      const nextQty = Math.max(1, qty)
      return {
        ...item,
        qty: nextQty,
        total_price: (item.unit_price ?? 0) * nextQty,
      }
    }))
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
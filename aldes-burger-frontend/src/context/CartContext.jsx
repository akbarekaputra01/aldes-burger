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
  if (!item.is_customized && item.menu_id) {
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
  const isCustomized = Boolean(inputItem.is_customized ?? modifiers.length > 0 || stackOrder.length > 0)

  const normalized = {
    id: inputItem.id ?? null,
    menu_id: inputItem.menu_id,
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

  normalized.id = normalized.id ?? createItemKey(normalized)
  return normalized
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadStoredCart)

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  }, [cart])

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + (item.qty ?? 1), 0), [cart])

  const addToCart = (item) => {
    const normalized = normalizeCartItem(item)

    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === normalized.id)
      if (!existing) {
        return [...prev, normalized]
      }

      const mergedQty = (existing.qty ?? 1) + normalized.qty
      return prev.map((cartItem) => {
        if (cartItem.id !== normalized.id) return cartItem
        return {
          ...cartItem,
          qty: mergedQty,
          total_price: (cartItem.unit_price ?? normalized.unit_price) * mergedQty,
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

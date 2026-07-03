'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type CartItem = {
  id: string
  slug: string
  name: string
  price: number
  image?: string
  sku?: string
  stock?: number
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  count: number
  subtotal: number
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  updateQty: (id: string, qty: number) => void
  removeItem: (id: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextType | null>(null)
const STORAGE_KEY = 'wken-cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {
      // ignore malformed cart
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, loaded])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, qty: number = 1) => {
    setItems((prev) => {
      const cap = item.stock ?? Infinity
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: Math.min(cap, i.quantity + qty) } : i
        )
      }
      return [...prev, { ...item, quantity: Math.min(cap, qty) }]
    })
  }, [])

  const updateQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      prev.flatMap((i) => {
        if (i.id !== id) return [i]
        const q = Math.max(0, Math.min(i.stock ?? Infinity, qty))
        return q === 0 ? [] : [{ ...i, quantity: q }]
      })
    )
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const count = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, count, subtotal, addItem, updateQty, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

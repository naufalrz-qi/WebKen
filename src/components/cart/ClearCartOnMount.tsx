'use client'

import { useEffect } from 'react'
import { useCart } from '@/components/cart/CartProvider'

// Clears the cart once, after an order is successfully placed.
export function ClearCartOnMount() {
  const { clear } = useCart()
  useEffect(() => {
    clear()
  }, [clear])
  return null
}

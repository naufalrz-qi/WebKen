'use client'

import { useState } from 'react'
import { Check, ShoppingCart } from '@phosphor-icons/react/dist/ssr'
import { useCart, type CartItem } from '@/components/cart/CartProvider'

export function QuickAddButton({
  product,
  className = '',
}: {
  product: Omit<CartItem, 'quantity'>
  className?: string
}) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  // Out of stock: no add button (card already shows a "Habis" badge).
  if ((product.stock ?? 0) <= 0) return null

  return (
    <button
      type="button"
      aria-label="Tambah ke keranjang"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        addItem(product, 1)
        setAdded(true)
        setTimeout(() => setAdded(false), 1200)
      }}
      className={`inline-flex items-center gap-1.5 rounded-md bg-interactive px-2.5 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-interactive-hover ${className}`}
    >
      {added ? <Check className="size-4" weight="bold" /> : <ShoppingCart className="size-4" />}
      {added ? 'Ditambah' : 'Tambah'}
    </button>
  )
}

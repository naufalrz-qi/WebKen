'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Minus, Plus } from '@phosphor-icons/react/dist/ssr'
import { Button } from '@/components/ui/button'
import { useCart, type CartItem } from '@/components/cart/CartProvider'

export function AddToCart({ product }: { product: Omit<CartItem, 'quantity'> }) {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const stock = product.stock ?? 0
  const outOfStock = stock <= 0

  if (outOfStock) {
    return (
      <Button className="h-12 w-full md:w-auto" disabled>
        Stok habis
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex h-12 w-fit items-center rounded-md border border-border bg-surface-1">
        <button
          type="button"
          aria-label="Kurangi"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="grid h-full w-11 place-items-center text-muted-foreground transition-colors hover:text-foreground"
        >
          <Minus className="size-4" />
        </button>
        <span className="w-10 text-center text-sm font-black">{qty}</span>
        <button
          type="button"
          aria-label="Tambah"
          onClick={() => setQty((q) => Math.min(stock, q + 1))}
          className="grid h-full w-11 place-items-center text-muted-foreground transition-colors hover:text-foreground"
        >
          <Plus className="size-4" />
        </button>
      </div>

      <Button
        className="h-12 flex-1 px-8 sm:flex-none"
        onClick={() => {
          addItem(product, qty)
          setAdded(true)
        }}
      >
        Tambah ke keranjang
      </Button>

      {added && (
        <Link
          href="/cart"
          className="text-center text-sm font-bold text-interactive hover:underline sm:text-left"
        >
          Lihat keranjang
        </Link>
      )}
    </div>
  )
}

'use client'

import Link from 'next/link'
import { ShoppingCart } from '@phosphor-icons/react/dist/ssr'
import { useCart } from '@/components/cart/CartProvider'

export function CartButton() {
  const { count } = useCart()

  return (
    <Link
      href="/cart"
      aria-label="Keranjang"
      className="relative flex size-9 items-center justify-center rounded-md border border-border bg-surface-1 text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
    >
      <ShoppingCart className="size-5" />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 grid min-w-4 place-items-center rounded-full bg-interactive px-1 text-[10px] font-black text-white">
          {count}
        </span>
      )}
    </Link>
  )
}

'use client'

import Link from 'next/link'
import { Minus, Plus, Trash } from '@phosphor-icons/react/dist/ssr'
import { ProductImage } from '@/components/ProductImage'
import { useCart } from '@/components/cart/CartProvider'
import { Button } from '@/components/ui/button'

export default function CartPage() {
  const { items, subtotal, updateQty, removeItem } = useCart()

  return (
    <main className="mx-auto min-h-[64vh] w-full max-w-5xl px-4 py-10 md:px-6 md:py-14">
      <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">Keranjang</h1>

      {items.length === 0 ? (
        <div className="mt-8 grid min-h-[240px] place-items-center rounded-md border border-dashed border-border bg-surface-1 p-10 text-center">
          <div>
            <p className="font-bold text-foreground">Keranjang masih kosong</p>
            <p className="mt-2 text-sm text-muted-foreground">Tambahkan model dari katalog untuk mulai memesan.</p>
            <Link
              href="/"
              className="mt-5 inline-flex h-10 items-center rounded-md bg-interactive px-5 text-sm font-bold text-white transition-colors hover:bg-interactive-hover"
            >
              Lihat katalog
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-md border border-border bg-surface-1 p-3"
              >
                <div className="size-20 shrink-0 overflow-hidden rounded-md bg-surface-2">
                  <ProductImage
                    src={item.image || '/uploads/images/no-image.webp'}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/product/${item.slug}`} className="line-clamp-2 text-sm font-black text-foreground hover:text-interactive">
                        {item.name}
                      </Link>
                      <p className="mt-1 text-xs font-semibold uppercase text-muted-foreground">{item.sku}</p>
                    </div>
                    <button
                      type="button"
                      aria-label="Hapus"
                      onClick={() => removeItem(item.id)}
                      className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash className="size-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-9 items-center rounded-md border border-border bg-background">
                      <button
                        type="button"
                        aria-label="Kurangi"
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="grid h-full w-9 place-items-center text-muted-foreground hover:text-foreground"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Tambah"
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="grid h-full w-9 place-items-center text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <p className="text-sm font-black text-foreground">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-md border border-border bg-surface-1 p-5">
            <h2 className="text-base font-black text-foreground">Ringkasan</h2>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-black text-foreground">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <Link href="/checkout" className="mt-5 block">
              <Button className="h-11 w-full">Checkout</Button>
            </Link>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Pembayaran dikonfirmasi manual setelah pesanan dibuat.
            </p>
          </aside>
        </div>
      )}
    </main>
  )
}

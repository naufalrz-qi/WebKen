'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { CheckCircle, WhatsappLogo } from '@phosphor-icons/react/dist/ssr'
import { ProductImage } from '@/components/ProductImage'
import { useCart } from '@/components/cart/CartProvider'
import { ClearCartOnMount } from '@/components/cart/ClearCartOnMount'
import { createOrder } from '@/app/actions/orders'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function CheckoutForm() {
  const { items, subtotal } = useCart()
  const [state, formAction, pending] = useActionState(createOrder, null)
  const itemsJson = JSON.stringify(items.map((i) => ({ id: i.id, quantity: i.quantity })))

  if (state?.success) {
    return (
      <div className="mx-auto max-w-lg rounded-md border border-border bg-surface-1 p-8 text-center">
        <ClearCartOnMount />
        <CheckCircle className="mx-auto size-12 text-success" weight="fill" />
        <h2 className="mt-4 text-2xl font-black text-foreground">Pesanan diterima</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Nomor pesanan <span className="font-bold text-foreground">{state.orderNumber}</span>. Pesanan kamu sudah tercatat. Kami akan menghubungi kamu untuk konfirmasi pembayaran.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          {state.whatsappUrl && (
            <a
              href={state.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#25D366] px-5 text-sm font-bold text-white transition-colors hover:bg-[#20bd5a]"
            >
              <WhatsappLogo className="size-5" weight="fill" />
              Konfirmasi via WhatsApp
            </a>
          )}
          <Link href="/" className="text-sm font-bold text-interactive hover:underline">
            Kembali belanja
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-surface-1 p-8 text-center">
        <p className="font-bold text-foreground">Keranjang kosong</p>
        <p className="mt-2 text-sm text-muted-foreground">Tambahkan produk sebelum checkout.</p>
        <Link href="/" className="mt-4 inline-block text-sm font-bold text-interactive hover:underline">
          Lihat katalog
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <form action={formAction} className="space-y-4 rounded-md border border-border bg-surface-1 p-5">
        {state?.error && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {state.error}
          </div>
        )}
        <input type="hidden" name="items" value={itemsJson} />

        <div className="space-y-2">
          <Label htmlFor="customer_name">Nama Penerima</Label>
          <Input id="customer_name" name="customer_name" required className="bg-background" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer_phone">Nomor WhatsApp</Label>
          <Input id="customer_phone" name="customer_phone" type="tel" placeholder="0812xxxxxxxx" required className="bg-background" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shipping_address">Alamat Pengiriman</Label>
          <Textarea id="shipping_address" name="shipping_address" required className="min-h-[90px] bg-background" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="note">Catatan (opsional)</Label>
          <Textarea id="note" name="note" className="min-h-[70px] bg-background" />
        </div>

        <Button type="submit" className="h-11 w-full" disabled={pending}>
          {pending ? 'Memproses...' : 'Buat Pesanan'}
        </Button>
      </form>

      <aside className="h-fit rounded-md border border-border bg-surface-1 p-5">
        <h2 className="text-base font-black text-foreground">Pesanan kamu</h2>
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between gap-3 text-sm">
              <div className="min-w-0">
                <div className="flex gap-2">
                  <div className="size-12 shrink-0 overflow-hidden rounded-md bg-surface-2">
                    <ProductImage
                      src={item.image || '/uploads/images/no-image.webp'}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-muted-foreground">
                    <span className="line-clamp-1 font-semibold text-foreground">{item.name}</span>
                    {item.quantity} x Rp {item.price.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
              <span className="shrink-0 font-bold text-foreground">
                Rp {(item.price * item.quantity).toLocaleString('id-ID')}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="text-lg font-black text-foreground">Rp {subtotal.toLocaleString('id-ID')}</span>
        </div>
      </aside>
    </div>
  )
}

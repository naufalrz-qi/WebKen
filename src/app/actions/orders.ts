'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type CartLine = { id: string; quantity: number }

// Guest checkout — no login required. Saves the order (status: pending) so the
// admin sees it, and returns a prefilled WhatsApp link the customer may optionally use.
export async function createOrder(prevState: any, formData: FormData) {
  const supabase = await createClient()
  if (!supabase) return { error: 'Database not connected' }

  const customer_name = ((formData.get('customer_name') as string) || '').trim()
  const customer_phone = ((formData.get('customer_phone') as string) || '').trim()
  const shipping_address = ((formData.get('shipping_address') as string) || '').trim()
  const note = ((formData.get('note') as string) || '').trim()

  if (!customer_name || !customer_phone || !shipping_address) {
    return { error: 'Lengkapi nama, nomor WhatsApp, dan alamat pengiriman.' }
  }

  let lines: CartLine[] = []
  try {
    lines = JSON.parse((formData.get('items') as string) || '[]')
  } catch {
    return { error: 'Keranjang tidak valid.' }
  }
  lines = lines.filter((l) => l && l.id && l.quantity > 0)
  if (lines.length === 0) return { error: 'Keranjang kosong.' }

  // Re-fetch authoritative price/stock server-side (never trust client prices).
  const ids = lines.map((l) => l.id)
  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('id, name, sku, price, stock, status')
    .in('id', ids)
  if (prodErr) return { error: prodErr.message }

  const items = []
  for (const line of lines) {
    const p = products?.find((pp) => pp.id === line.id)
    if (!p) return { error: 'Beberapa produk tidak ditemukan atau sudah dihapus.' }
    if (p.status !== 'Active') return { error: `Produk ${p.name} sedang tidak tersedia.` }
    if (line.quantity > (p.stock ?? 0)) {
      return { error: `Stok ${p.name} tidak mencukupi (tersisa ${p.stock ?? 0}).` }
    }
    items.push({
      product_id: p.id,
      product_name: p.name,
      sku: p.sku,
      unit_price: Number(p.price),
      quantity: line.quantity,
    })
  }
  const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)

  const order_number =
    'WK-' +
    Date.now().toString(36).toUpperCase() +
    Math.random().toString(36).slice(2, 5).toUpperCase()

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert([
      {
        order_number,
        user_id: null,
        customer_name,
        customer_phone,
        shipping_address,
        note: note || null,
        subtotal,
      },
    ])
    .select('id')
    .single()
  if (orderErr) return { error: orderErr.message }

  const { error: itemsErr } = await supabase
    .from('order_items')
    .insert(items.map((i) => ({ ...i, order_id: order.id })))
  if (itemsErr) {
    await supabase.from('orders').delete().eq('id', order.id)
    return { error: itemsErr.message }
  }

  // Optional WhatsApp handoff — order is already saved regardless.
  const { data: settings } = await supabase
    .from('site_settings')
    .select('whatsapp_number')
    .limit(1)
    .maybeSingle()

  let whatsappUrl: string | null = null
  if (settings?.whatsapp_number) {
    const lineText = items
      .map((i) => `- ${i.quantity}x ${i.product_name} (Rp ${(i.unit_price * i.quantity).toLocaleString('id-ID')})`)
      .join('\n')
    const message =
      `Halo, saya membuat pesanan:\n\n` +
      `No: ${order_number}\n${lineText}\n\n` +
      `Total: Rp ${subtotal.toLocaleString('id-ID')}\n` +
      `Nama: ${customer_name}\nHP: ${customer_phone}\nAlamat: ${shipping_address}`
    whatsappUrl = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(message)}`
  }

  revalidatePath('/admin/orders')
  revalidatePath('/admin')
  return { success: true, orderNumber: order_number, whatsappUrl }
}

// Admin-only (enforced by RLS: orders UPDATE + stock_movements INSERT require is_admin()).
// ponytail: stock is decremented when an order first reaches a "taken" state (paid/
// shipped/completed) and restored when it leaves one (cancelled). Keyed on old->new so
// any transition path is consistent. Overselling on the last unit is caught at checkout,
// not reserved at cart time — negligible race at this scale.
const STOCK_TAKEN = ['paid', 'shipped', 'completed']

export async function updateOrderStatus(orderId: string, formData: FormData) {
  const supabase = await createClient()
  if (!supabase) return

  const newStatus = formData.get('status') as string
  if (!['pending', 'paid', 'shipped', 'completed', 'cancelled'].includes(newStatus)) return

  const { data: order } = await supabase
    .from('orders')
    .select('status, order_items(product_id, quantity)')
    .eq('id', orderId)
    .single()
  if (!order) return

  const wasTaken = STOCK_TAKEN.includes(order.status)
  const willTake = STOCK_TAKEN.includes(newStatus)
  const lines = (order.order_items ?? []).filter((i: any) => i.product_id)

  if (!wasTaken && willTake && lines.length > 0) {
    await supabase.from('stock_movements').insert(
      lines.map((i: any) => ({
        product_id: i.product_id,
        movement_type: 'out',
        quantity: i.quantity,
        note: `Order ${orderId} → ${newStatus}`,
      }))
    )
  } else if (wasTaken && !willTake && lines.length > 0) {
    await supabase.from('stock_movements').insert(
      lines.map((i: any) => ({
        product_id: i.product_id,
        movement_type: 'in',
        quantity: i.quantity,
        note: `Order ${orderId} → ${newStatus} (restore)`,
      }))
    )
  }

  await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/admin')
}

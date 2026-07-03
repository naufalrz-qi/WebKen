'use client'

import { useState } from 'react'
import { CaretDown } from '@phosphor-icons/react/dist/ssr'
import { updateOrderStatus } from '@/app/actions/orders'
import { Button } from '@/components/ui/button'

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'bg-medium/15 text-medium' },
  paid: { label: 'Paid', cls: 'bg-info/10 text-info' },
  shipped: { label: 'Shipped', cls: 'bg-info/10 text-info' },
  completed: { label: 'Completed', cls: 'bg-success/10 text-success' },
  cancelled: { label: 'Cancelled', cls: 'bg-destructive/10 text-destructive' },
}

const NEXT_ACTIONS: Record<string, { status: string; label: string; variant?: 'destructive' }[]> = {
  pending: [
    { status: 'paid', label: 'Tandai Dibayar' },
    { status: 'cancelled', label: 'Batalkan', variant: 'destructive' },
  ],
  paid: [
    { status: 'shipped', label: 'Tandai Dikirim' },
    { status: 'cancelled', label: 'Batalkan', variant: 'destructive' },
  ],
  shipped: [{ status: 'completed', label: 'Tandai Selesai' }],
  completed: [],
  cancelled: [],
}

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  shipping_address: string
  note?: string
  status: string
  subtotal: number
  created_at: string
  order_items?: Array<{
    id: string
    product_name: string
    sku: string
    unit_price: number
    quantity: number
  }>
}

interface Props {
  orders: Order[]
}

export function ExpandableOrdersTable({ orders }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="overflow-x-auto rounded-md border border-border bg-surface-1">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs font-black uppercase text-muted-foreground">
            <th className="w-8 px-4 py-3"></th>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.flatMap((order) => {
            const status = STATUS[order.status] ?? STATUS.pending
            const actions = NEXT_ACTIONS[order.status] ?? []
            const isExpanded = expandedId === order.id
            const updateStatus = updateOrderStatus.bind(null, order.id)

            const rows = [
              <tr
                key={`row-${order.id}`}
                className="border-b border-border hover:bg-surface-2 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
              >
                <td className="px-4 py-3">
                  <CaretDown
                    className={`size-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    weight="bold"
                  />
                </td>
                <td className="px-4 py-3 font-black text-foreground">{order.order_number}</td>
                <td className="px-4 py-3 text-muted-foreground">{order.customer_name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-sm px-2 py-1 text-[11px] font-black uppercase ${status.cls}`}>
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-black text-foreground">
                  Rp {Number(order.subtotal).toLocaleString('id-ID')}
                </td>
              </tr>,
            ]

            if (isExpanded) {
              rows.push(
                <tr key={`expand-${order.id}`} className="bg-surface-2">
                  <td colSpan={6} className="p-6">
                    <div className="space-y-6">
                      {/* Items */}
                      <div>
                        <p className="text-xs font-black uppercase text-muted-foreground mb-3">Items</p>
                        <div className="divide-y divide-border rounded-md border border-border">
                          {(order.order_items ?? []).map((item) => (
                            <div key={item.id} className="flex items-center justify-between gap-3 p-3">
                              <div className="min-w-0">
                                <p className="line-clamp-1 text-sm font-bold text-foreground">{item.product_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.sku} • {item.quantity} x Rp {Number(item.unit_price).toLocaleString('id-ID')}
                                </p>
                              </div>
                              <p className="shrink-0 text-sm font-black text-foreground">
                                Rp {(Number(item.unit_price) * item.quantity).toLocaleString('id-ID')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping */}
                      <div className="rounded-md bg-surface-1 p-4">
                        <p className="font-black text-foreground mb-3">Pengiriman</p>
                        <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                        <p className="text-sm text-muted-foreground">{order.shipping_address}</p>
                        {order.note && <p className="text-sm text-muted-foreground mt-2">Catatan: {order.note}</p>}
                      </div>

                      {/* Actions */}
                      {actions.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {actions.map((action) => (
                            <form key={action.status} action={updateStatus}>
                              <input type="hidden" name="status" value={action.status} />
                              <Button
                                type="submit"
                                variant={action.variant === 'destructive' ? 'destructive' : 'default'}
                                size="sm"
                              >
                                {action.label}
                              </Button>
                            </form>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )
            }

            return rows
          })}
        </tbody>
      </table>
    </div>
  )
}

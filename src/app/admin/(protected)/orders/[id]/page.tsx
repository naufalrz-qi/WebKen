import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr"
import { createClient } from "@/lib/supabase/server"
import { updateOrderStatus } from "@/app/actions/orders"
import { Button } from "@/components/ui/button"

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-medium/15 text-medium" },
  paid: { label: "Paid", cls: "bg-info/10 text-info" },
  shipped: { label: "Shipped", cls: "bg-info/10 text-info" },
  completed: { label: "Completed", cls: "bg-success/10 text-success" },
  cancelled: { label: "Cancelled", cls: "bg-destructive/10 text-destructive" },
}

// Next status options offered per current status.
const NEXT_ACTIONS: Record<string, { status: string; label: string; variant?: "destructive" }[]> = {
  pending: [
    { status: "paid", label: "Tandai Dibayar" },
    { status: "cancelled", label: "Batalkan", variant: "destructive" },
  ],
  paid: [
    { status: "shipped", label: "Tandai Dikirim" },
    { status: "cancelled", label: "Batalkan", variant: "destructive" },
  ],
  shipped: [{ status: "completed", label: "Tandai Selesai" }],
  completed: [],
  cancelled: [],
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  if (!supabase) return notFound()

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single()
  if (!order) return notFound()

  const status = STATUS[order.status] ?? STATUS.pending
  const actions = NEXT_ACTIONS[order.status] ?? []
  const updateStatus = updateOrderStatus.bind(null, order.id)

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Kembali ke orders
      </Link>

      <div className="rounded-md border border-border bg-surface-1 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">{order.order_number}</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(order.created_at).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}
            </p>
          </div>
          <span className={`rounded-sm px-3 py-1.5 text-xs font-black uppercase ${status.cls}`}>
            {status.label}
          </span>
        </div>

        <div className="mt-6 divide-y divide-border border-y border-border">
          {(order.order_items ?? []).map((item: any) => (
            <div key={item.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="line-clamp-1 text-sm font-bold text-foreground">{item.product_name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.sku} &middot; {item.quantity} x Rp {Number(item.unit_price).toLocaleString("id-ID")}
                </p>
              </div>
              <p className="shrink-0 text-sm font-black text-foreground">
                Rp {(Number(item.unit_price) * item.quantity).toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-xl font-black text-foreground">
            Rp {Number(order.subtotal).toLocaleString("id-ID")}
          </span>
        </div>

        <div className="mt-6 grid gap-2 rounded-md bg-surface-2 p-4 text-sm">
          <p className="font-black text-foreground">Pengiriman</p>
          <p className="text-muted-foreground">{order.customer_name} &middot; {order.customer_phone}</p>
          <p className="text-muted-foreground">{order.shipping_address}</p>
          {order.note && <p className="text-muted-foreground">Catatan: {order.note}</p>}
        </div>

        {actions.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-5">
            {actions.map((action) => (
              <form key={action.status} action={updateStatus}>
                <input type="hidden" name="status" value={action.status} />
                <Button type="submit" variant={action.variant === "destructive" ? "destructive" : "default"}>
                  {action.label}
                </Button>
              </form>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

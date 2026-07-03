import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CurrencyCircleDollar, Package, Receipt, WarningCircle } from "@phosphor-icons/react/dist/ssr"
import { createClient } from "@/lib/supabase/server"

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-medium/15 text-medium" },
  paid: { label: "Paid", cls: "bg-info/10 text-info" },
  shipped: { label: "Shipped", cls: "bg-info/10 text-info" },
  completed: { label: "Completed", cls: "bg-success/10 text-success" },
  cancelled: { label: "Cancelled", cls: "bg-destructive/10 text-destructive" },
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  let totalProducts = 0
  let activeStock = 0
  let lowStock = 0
  let pendingOrders = 0
  let revenue = 0
  let recentOrders: any[] = []

  if (supabase) {
    const [productsRes, ordersRes] = await Promise.all([
      supabase.from("products").select("stock, price"),
      supabase.from("orders").select("id, order_number, status, subtotal, created_at").order("created_at", { ascending: false }),
    ])
    const products = productsRes.data
    const orders = ordersRes.data

    if (products) {
      totalProducts = products.length
      activeStock = products.reduce((acc, p) => acc + (p.stock || 0), 0)
      lowStock = products.filter((p) => Number(p.stock || 0) <= 2).length
    }
    if (orders) {
      pendingOrders = orders.filter((o) => o.status === "pending").length
      revenue = orders
        .filter((o) => ["paid", "shipped", "completed"].includes(o.status))
        .reduce((acc, o) => acc + Number(o.subtotal), 0)
      recentOrders = orders.slice(0, 6)
    }
  }

  const metrics = [
    { label: "Revenue", value: `Rp ${revenue.toLocaleString("id-ID")}`, note: "From confirmed orders", icon: CurrencyCircleDollar },
    { label: "Pending Orders", value: pendingOrders, note: "Awaiting confirmation", icon: Receipt },
    { label: "Total Products", value: totalProducts, note: "Unique SKUs in catalog", icon: Package },
    { label: "Low Stock", value: lowStock, note: "Items at 2 units or less", icon: WarningCircle },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border bg-surface-1 p-5 md:p-6">
        <p className="text-xs font-black uppercase text-interactive">Operations</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Snapshot penjualan, stok, dan pesanan yang perlu ditindaklanjuti.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="bg-surface-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground">{metric.label}</CardTitle>
              <metric.icon className="size-5 text-interactive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground">{metric.value}</div>
              <p className="mt-2 text-xs font-medium text-muted-foreground">{metric.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="rounded-md border border-border bg-surface-1 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-foreground">Pesanan terbaru</h2>
          <Link href="/admin/orders" className="text-sm font-bold text-interactive hover:underline">
            Lihat semua
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Belum ada pesanan.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {recentOrders.map((order) => {
              const status = STATUS[order.status] ?? STATUS.pending
              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between gap-3 rounded-md bg-surface-2 p-3 transition-colors hover:bg-surface-3"
                >
                  <span className="font-black text-foreground">{order.order_number}</span>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-sm px-2 py-1 text-[11px] font-black uppercase ${status.cls}`}>
                      {status.label}
                    </span>
                    <span className="font-bold text-foreground">Rp {Number(order.subtotal).toLocaleString("id-ID")}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

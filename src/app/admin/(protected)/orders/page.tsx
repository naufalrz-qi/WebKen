import { createClient } from "@/lib/supabase/server"
import { ExpandableOrdersTable } from "@/components/admin/ExpandableOrdersTable"

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  let orders: any[] = []
  if (supabase) {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
    orders = data || []
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border bg-surface-1 p-5">
        <p className="text-xs font-black uppercase text-interactive">Sales desk</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Kelola pesanan pelanggan dan status pembayaran.</p>
      </div>

      {orders.length === 0 ? (
        <div className="grid min-h-[200px] place-items-center rounded-md border border-dashed border-border bg-surface-1 p-10 text-center">
          <p className="text-sm text-muted-foreground">Belum ada pesanan masuk.</p>
        </div>
      ) : (
        <ExpandableOrdersTable orders={orders} />
      )}
    </div>
  )
}

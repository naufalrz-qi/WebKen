"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "@phosphor-icons/react/dist/ssr"
import { Dialog, DialogHeader, DialogTitle, DialogClose, DialogBody } from "@/components/ui/dialog"
import { StockAdjustmentForm } from "@/components/StockAdjustmentForm"
import { Pagination } from "@/components/Pagination"

const TYPE_LABEL: Record<string, string> = {
  in: "Masuk",
  out: "Keluar",
  adjustment: "Koreksi",
  damaged: "Rusak",
}

const TYPE_BADGE_CLASS: Record<string, string> = {
  in: "border-transparent bg-success/10 text-success",
  adjustment: "border-transparent bg-info/10 text-info",
  out: "border-transparent bg-critical/10 text-critical",
  damaged: "border-transparent bg-critical/10 text-critical",
}

interface StockLedgerTableProps {
  movements: any[]
  products: { id: string; name: string; sku: string }[]
  currentPage: number
  totalPages: number
  selectedProductId?: string
}

export function StockLedgerTable({
  movements,
  products,
  currentPage,
  totalPages,
  selectedProductId,
}: StockLedgerTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [modalOpen, setModalOpen] = useState(false)

  const handleFilterChange = (productId: string) => {
    const params = new URLSearchParams()
    if (productId) params.set("product", productId)
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`)
  }

  return (
    <>
      <div className="flex flex-col overflow-hidden rounded-md border border-border bg-surface-1 shadow-[0_18px_44px_-38px_hsl(var(--foreground))]">
        <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <select
            aria-label="Filter produk"
            value={selectedProductId || ""}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="h-10 w-full max-w-sm rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive/25"
          >
            <option value="">Semua produk</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>
          <Button onClick={() => setModalOpen(true)} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" /> Catat Pergerakan
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-surface-2/80">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Tanggal</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead>Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    Belum ada pergerakan stok.
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((movement) => (
                  <TableRow key={movement.id} className="border-border transition-colors hover:bg-surface-2/75">
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(movement.created_at).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {movement.products?.name || "—"}
                      <span className="ml-2 font-mono text-xs text-muted-foreground">{movement.products?.sku}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${TYPE_BADGE_CLASS[movement.movement_type] || ""} text-[10px] uppercase px-2 py-0 h-5`}
                      >
                        {TYPE_LABEL[movement.movement_type] || movement.movement_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">{movement.quantity}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {movement.note || "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogHeader>
          <DialogTitle>Catat Pergerakan Stok</DialogTitle>
          <DialogClose onClose={() => setModalOpen(false)} />
        </DialogHeader>
        <DialogBody>
          <StockAdjustmentForm
            products={products}
            defaultProductId={selectedProductId}
            onSuccess={() => setModalOpen(false)}
          />
        </DialogBody>
      </Dialog>
    </>
  )
}

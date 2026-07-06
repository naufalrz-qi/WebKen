"use client"

import { useActionState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createStockMovement } from "@/app/actions/products"

const MOVEMENT_TYPES = [
  { value: "in", label: "Stok masuk" },
  { value: "adjustment", label: "Koreksi manual (boleh negatif)" },
  { value: "damaged", label: "Rusak / hilang" },
]

export function StockAdjustmentForm({
  products,
  defaultProductId,
  onSuccess,
}: {
  products: { id: string; name: string; sku: string }[]
  defaultProductId?: string
  onSuccess: () => void
}) {
  const [state, formAction, pending] = useActionState(createStockMovement, null)

  useEffect(() => {
    if (state?.success) onSuccess()
  }, [state, onSuccess])

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="product_id">Produk</Label>
        <select
          id="product_id"
          name="product_id"
          defaultValue={defaultProductId || ""}
          required
          className="flex h-10 w-full rounded-md border border-border bg-surface-1 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive/25"
        >
          <option value="" disabled>
            Pilih produk...
          </option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.sku})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="movement_type">Jenis</Label>
          <select
            id="movement_type"
            name="movement_type"
            defaultValue="in"
            className="flex h-10 w-full rounded-md border border-border bg-surface-1 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive/25"
          >
            {MOVEMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Jumlah</Label>
          <Input id="quantity" name="quantity" type="number" required className="bg-surface-1 font-mono" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Catatan (opsional)</Label>
        <Textarea id="note" name="note" className="bg-surface-1" />
      </div>

      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Simpan pergerakan"}
        </Button>
      </div>
    </form>
  )
}

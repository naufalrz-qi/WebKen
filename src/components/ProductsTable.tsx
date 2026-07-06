'use client'

import { useState } from "react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { MagnifyingGlass, PencilSimple, Trash, CaretUp, CaretDown, Plus, ClipboardText } from "@phosphor-icons/react/dist/ssr"
import { deleteProduct } from "@/app/actions/products"
import { Dialog, DialogHeader, DialogTitle, DialogClose, DialogBody } from "@/components/ui/dialog"
import { ProductForm } from "@/app/admin/(protected)/products/product-form"

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null

export function ProductsTable({ initialData, brands = [], categories = [] }: { initialData: any[], brands?: any[], categories?: any[] }) {
  const [search, setSearch] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<any | null>(null)

  const openAddModal = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  const openEditModal = (product: any) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingProduct(null)
  }

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // Filter
  const filteredData = initialData.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.sku.toLowerCase().includes(search.toLowerCase()) ||
    item.brand.toLowerCase().includes(search.toLowerCase())
  )

  // Sort
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;
    
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];

    if (sortConfig.key === 'price' && !!a.id) {
       aVal = Number(a.price)
       bVal = Number(b.price)
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  })

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? <CaretUp className="inline ml-1" /> : <CaretDown className="inline ml-1" />
  }

  return (
    <>
      <div className="flex flex-col overflow-hidden rounded-md border border-border bg-surface-1 shadow-[0_18px_44px_-38px_hsl(var(--foreground))]">
        <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Filter by SKU, Name, or Brand..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 bg-background pl-9 text-sm"
            />
          </div>
          <Button onClick={openAddModal} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-surface-2/80">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="cursor-pointer" onClick={() => handleSort('sku')}>
                  SKU <SortIcon columnKey="sku" />
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                  Name <SortIcon columnKey="name" />
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('brand')}>
                  Brand <SortIcon columnKey="brand" />
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort('price')}>
                  Price <SortIcon columnKey="price" />
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort('stock')}>
                  Stock <SortIcon columnKey="stock" />
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                  Status <SortIcon columnKey="status" />
                </TableHead>
                <TableHead className="w-10 h-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((item) => {
                  const isDbProduct = !!item.id;
                  const status = item.status;
                  const price = isDbProduct ? `Rp ${Number(item.price).toLocaleString('id-ID')}` : item.price;
                  
                  return (
                    <TableRow key={item.sku} className="border-border transition-colors hover:bg-surface-2/75">
                      <TableCell className="font-mono text-xs text-muted-foreground py-2">{item.sku}</TableCell>
                      <TableCell className="text-sm font-medium py-2">{item.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground py-2">{item.brand}</TableCell>
                      <TableCell className="text-sm text-right py-2">{price}</TableCell>
                      <TableCell className="text-sm text-right py-2">
                        <span className={item.stock === 0 ? "text-destructive" : "text-foreground"}>{item.stock}</span>
                      </TableCell>
                      <TableCell className="py-2">
                        {status === "Active" ? (
                          <Badge variant="secondary" className="bg-success/15 text-success hover:bg-success/20 border-transparent text-[10px] uppercase px-2 py-0 h-5">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-transparent text-[10px] uppercase px-2 py-0 h-5">
                            {status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/stock-ledger?product=${item.id}`}
                            aria-label="Lihat ledger"
                            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-7 w-7 text-muted-foreground hover:text-foreground")}
                          >
                            <ClipboardText className="h-4 w-4" />
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => openEditModal(item)}
                          >
                            <PencilSimple className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive/70 hover:text-destructive"
                            onClick={() => {
                              setItemToDelete(item)
                              setDeleteModalOpen(true)
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex items-center justify-between border-t border-border bg-background/55 p-4 text-sm text-muted-foreground">
          <div className="font-semibold">Showing {sortedData.length} products</div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogHeader>
          <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogClose onClose={closeModal} />
        </DialogHeader>
        <DialogBody>
          <ProductForm
            key={editingProduct?.id ?? 'new'}
            product={editingProduct}
            brands={brands}
            categories={categories}
            onCancel={closeModal}
          />
        </DialogBody>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogClose onClose={() => setDeleteModalOpen(false)} />
        </DialogHeader>
        <DialogBody>
          <p className="text-sm text-muted-foreground mb-6">
            Are you sure you want to delete <strong className="text-foreground">{itemToDelete?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <form action={deleteProduct.bind(null, itemToDelete?.id)}>
              <Button type="submit" variant="destructive" onClick={() => setDeleteModalOpen(false)}>
                Delete Product
              </Button>
            </form>
          </div>
        </DialogBody>
      </Dialog>
    </>
  )
}

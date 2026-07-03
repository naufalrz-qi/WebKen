'use client'

import { useState } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PencilSimple, Trash, Plus } from "@phosphor-icons/react/dist/ssr"
import { deleteBrand } from "@/app/actions/taxonomy"
import { Dialog, DialogHeader, DialogTitle, DialogClose, DialogBody } from "@/components/ui/dialog"
import { BrandForm } from "@/app/admin/(protected)/brands/brand-form"

export function BrandsTable({ initialData }: { initialData: any[] }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<any | null>(null)
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<any | null>(null)

  const openAddModal = () => {
    setEditingBrand(null)
    setModalOpen(true)
  }

  const openEditModal = (brand: any) => {
    setEditingBrand(brand)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingBrand(null)
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-md border border-border bg-surface-1 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-interactive">Taxonomy</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">Brands</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage product brands and logos.</p>
        </div>
        <Button onClick={openAddModal} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Add Brand
        </Button>
      </div>

      <div className="flex flex-col overflow-hidden rounded-md border border-border bg-surface-1 shadow-[0_18px_44px_-38px_hsl(var(--foreground))]">
        <div className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-semibold text-foreground">Name</TableHead>
                <TableHead className="font-semibold text-foreground">Slug</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No brands found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                initialData.map((item) => (
                  <TableRow key={item.id} className="border-border hover:bg-surface-2/75">
                    <TableCell className="font-medium text-foreground py-3 flex items-center gap-3">
                      {item.logo_url ? (
                        <img src={item.logo_url} alt={item.name} className="h-8 w-8 rounded-md object-cover" />
                      ) : (
                        <img src="/uploads/images/no-image.webp" alt="No image" className="h-8 w-8 rounded-md object-cover opacity-50" />
                      )}
                      {item.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground py-3">{item.slug}</TableCell>
                    <TableCell className="py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogHeader>
          <DialogTitle>{editingBrand ? "Edit Brand" : "Add Brand"}</DialogTitle>
          <DialogClose onClose={closeModal} />
        </DialogHeader>
        <DialogBody>
          <BrandForm
            key={editingBrand?.id ?? 'new'}
            brand={editingBrand}
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
            <form action={deleteBrand.bind(null, itemToDelete?.id)}>
              <Button type="submit" variant="destructive" onClick={() => setDeleteModalOpen(false)}>
                Delete Brand
              </Button>
            </form>
          </div>
        </DialogBody>
      </Dialog>
    </>
  )
}

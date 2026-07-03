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
import { deleteCategory } from "@/app/actions/taxonomy"
import { Dialog, DialogHeader, DialogTitle, DialogClose, DialogBody } from "@/components/ui/dialog"
import { CategoryForm } from "@/app/admin/(protected)/categories/category-form"

export function CategoriesTable({ initialData }: { initialData: any[] }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any | null>(null)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<any | null>(null)

  const openAddModal = () => {
    setEditingCategory(null)
    setModalOpen(true)
  }

  const openEditModal = (category: any) => {
    setEditingCategory(category)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingCategory(null)
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-md border border-border bg-surface-1 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-interactive">Taxonomy</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage product categories and groupings.</p>
        </div>
        <Button onClick={openAddModal} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Add Category
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
                    No categories found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                initialData.map((item) => (
                  <TableRow key={item.id} className="border-border hover:bg-surface-2/75">
                    <TableCell className="font-medium text-foreground py-3">
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
          <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
          <DialogClose onClose={closeModal} />
        </DialogHeader>
        <DialogBody>
          <CategoryForm
            key={editingCategory?.id ?? 'new'}
            category={editingCategory}
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
            <form action={deleteCategory.bind(null, itemToDelete?.id)}>
              <Button type="submit" variant="destructive" onClick={() => setDeleteModalOpen(false)}>
                Delete Category
              </Button>
            </form>
          </div>
        </DialogBody>
      </Dialog>
    </>
  )
}

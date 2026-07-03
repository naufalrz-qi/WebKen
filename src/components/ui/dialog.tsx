"use client"

import * as React from "react"
import { X } from "@phosphor-icons/react/dist/ssr"
import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    if (open) document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0"
        onClick={() => onOpenChange(false)}
      />
      {/* Content wrapper */}
      <div className="relative z-50 mt-[5vh] mb-[5vh] max-h-[90vh] w-full max-w-3xl mx-4 overflow-y-auto rounded-md border border-border bg-background shadow-xl animate-in fade-in-0 zoom-in-95">
        {children}
      </div>
    </div>
  )
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface-1 px-6 py-4", className)}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function DialogClose({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  )
}

function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6", className)} {...props} />
  )
}

export { Dialog, DialogHeader, DialogTitle, DialogClose, DialogBody }

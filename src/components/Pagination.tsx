"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const buildHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    return `${pathname}?${params.toString()}`
  }

  const goTo = (page: number) => {
    if (page < 1 || page > totalPages) return
    router.push(buildHref(page))
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
  )

  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Navigasi halaman">
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Halaman sebelumnya"
        disabled={currentPage <= 1}
        onClick={() => goTo(currentPage - 1)}
      >
        <CaretLeft className="size-4" />
      </Button>

      {pages.map((page, index) => {
        const prevPage = pages[index - 1]
        const showEllipsis = prevPage !== undefined && page - prevPage > 1
        return (
          <span key={page} className="flex items-center gap-1">
            {showEllipsis && <span className="px-1 text-sm text-muted-foreground">…</span>}
            <Button
              variant={page === currentPage ? "default" : "outline"}
              size="icon-sm"
              aria-current={page === currentPage ? "page" : undefined}
              onClick={() => goTo(page)}
            >
              {page}
            </Button>
          </span>
        )
      })}

      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Halaman berikutnya"
        disabled={currentPage >= totalPages}
        onClick={() => goTo(currentPage + 1)}
      >
        <CaretRight className="size-4" />
      </Button>
    </nav>
  )
}

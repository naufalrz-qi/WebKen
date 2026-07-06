"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookmarkSimple,
  ClipboardText,
  Gear,
  House,
  Package,
  Receipt,
  SignOut,
  SquaresFour,
  Tag,
} from "@phosphor-icons/react/dist/ssr"
import { logout } from "@/app/actions/auth"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: SquaresFour, exact: true },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/products", label: "Inventory", icon: Package },
  { href: "/admin/stock-ledger", label: "Stock Ledger", icon: ClipboardText },
  { href: "/admin/brands", label: "Brands", icon: BookmarkSimple },
  { href: "/admin/categories", label: "Categories", icon: Tag },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? "bg-foreground text-background shadow-[0_14px_34px_-28px_hsl(var(--foreground))]"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <item.icon className="size-4" weight={isActive ? "fill" : "regular"} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto space-y-1 border-t border-border p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <House className="size-4" />
          View Store
        </Link>
        <Link
          href="/admin/settings"
          className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-all ${
            pathname.startsWith("/admin/settings")
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          }`}
        >
          <Gear className="size-4" weight={pathname.startsWith("/admin/settings") ? "fill" : "regular"} />
          Settings
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <SignOut className="size-4" />
            Sign Out
          </button>
        </form>
      </div>
    </>
  )
}

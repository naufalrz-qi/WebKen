import Link from "next/link"
import { ProductImage } from "@/components/ProductImage"
import { QuickAddButton } from "@/components/cart/QuickAddButton"

export default function ProductCard({ product }: { product: any }) {
  const images = product.product_images || product.images || []
  const sortedImages = [...images].sort(
    (a: any, b: any) => Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary)) || (a.sort_order || 0) - (b.sort_order || 0)
  )
  const imageObj = sortedImages[0]
  const image =
    imageObj?.image_url ||
    (typeof imageObj === "string" ? imageObj : product.image) ||
    "/uploads/images/no-image.webp"
  const stock = Number(product.stock || 0)
  const inStock = stock > 0 || product.stock === "In Stock"
  const price =
    typeof product.price === "number" ? `Rp ${Number(product.price).toLocaleString("id-ID")}` : product.price
  const brandName = product.brands?.name || product.brand || "W//KEN"

  return (
    <div className="group relative flex min-w-0 flex-col overflow-hidden rounded-md border border-border bg-surface-1 transition-all duration-200 hover:-translate-y-0.5 hover:border-interactive/45 hover:shadow-[0_20px_48px_-34px_hsl(var(--foreground))]">
      <Link href={`/product/${product.slug}`} className="flex min-w-0 flex-1 flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
          <ProductImage
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-2 top-2 rounded-sm bg-background/88 px-2 py-1 text-[10px] font-black uppercase text-foreground backdrop-blur">
            {brandName}
          </div>
          <div
            className={`absolute bottom-2 right-2 rounded-sm px-2 py-1 text-[10px] font-black uppercase backdrop-blur ${
              inStock ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
            }`}
          >
            {inStock ? `${stock} tersedia` : "Habis"}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-3 md:p-4">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-sm font-black leading-snug text-foreground">
              {product.name}
            </h3>
            <p className="mt-2 truncate text-xs font-semibold uppercase text-muted-foreground">
              {product.scale || "Collector model"} / {product.sku}
            </p>
          </div>
          <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-3">
            <p className="text-sm font-black text-foreground">{price}</p>
            <span className="text-xs font-bold text-interactive">Detail</span>
          </div>
        </div>
      </Link>

      <div className="absolute right-2 top-2">
        <QuickAddButton
          product={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: Number(product.price),
            image,
            sku: product.sku,
            stock,
          }}
        />
      </div>
    </div>
  )
}

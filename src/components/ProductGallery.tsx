"use client"

import { useState } from "react"
import { ProductImage } from "@/components/ProductImage"

interface ProductGalleryProps {
  images: string[]
  alt: string
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [active, setActive] = useState(0)

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-md border border-border bg-surface-1 p-2">
        <div className="aspect-[4/3] overflow-hidden rounded-sm bg-surface-2">
          <ProductImage src={images[active]} alt={alt} className="h-full w-full object-cover" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {images.slice(0, 4).map((img, index) => (
          <button
            key={`${img}-${index}`}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Lihat gambar ${index + 1}`}
            className={`aspect-square overflow-hidden rounded-md border bg-surface-2 ${
              index === active ? "border-interactive" : "border-border opacity-70"
            }`}
          >
            <ProductImage src={img} alt={`${alt} ${index + 1}`} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </section>
  )
}

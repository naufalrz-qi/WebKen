'use client'

import { useState } from 'react'

const FALLBACK = '/uploads/images/no-image.webp'

interface ProductImageProps {
  src: string
  alt: string
  className?: string
}

export function ProductImage({ src, alt, className = '' }: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK)

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setImgSrc(FALLBACK)}
    />
  )
}

export const CATALOG_PAGE_SIZE = 12

export const SORT_OPTIONS = [
  { value: "terbaru", label: "Terbaru" },
  { value: "harga-asc", label: "Harga: Rendah ke Tinggi" },
  { value: "harga-desc", label: "Harga: Tinggi ke Rendah" },
  { value: "az", label: "A-Z" },
] as const

export function getRange(page: number, pageSize: number = CATALOG_PAGE_SIZE) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  return { from, to }
}

export function getTotalPages(count: number, pageSize: number = CATALOG_PAGE_SIZE) {
  return Math.max(1, Math.ceil(count / pageSize))
}

export function parsePage(value: string | undefined) {
  const page = Number(value)
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
}

export const SPORTS_CATEGORY = 'MLC1276'

export const BRANDS = [
  'Nike',
  'Adidas',
  'Puma',
  'New Balance',
  'Under Armour',
  'Columbia',
] as const

export const CATEGORIES = [
  { id: 'zapatillas', label: 'Zapatillas', query: 'zapatillas' },
  { id: 'ropa', label: 'Ropa', query: 'ropa deportiva' },
  { id: 'accesorios', label: 'Accesorios', query: 'accesorios deportivos' },
  { id: 'futbol', label: 'Fútbol', query: 'fútbol' },
  { id: 'running', label: 'Running', query: 'running' },
  { id: 'trekking', label: 'Trekking', query: 'trekking' },
] as const

export const PRICE_PRESETS = [
  { id: 'all', label: 'Cualquier precio', min: null, max: null },
  { id: '50', label: 'Hasta $50.000', min: null, max: 50000 },
  { id: '50-80', label: '$50.000 – $80.000', min: 50000, max: 80000 },
  { id: '80-120', label: '$80.000 – $120.000', min: 80000, max: 120000 },
  { id: '120', label: 'Más de $120.000', min: 120000, max: null },
] as const

export const DEFAULT_SEARCH = {
  q: '',
  brand: '',
  category: '',
  minPrice: null,
  maxPrice: null,
  dealsOnly: false,
  officialOnly: false,
  sort: 'relevance' as const,
  offset: 0,
}

export function formatClp(value: number) {
  if (!Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value)
}

export function inferBrand(title: string | null | undefined) {
  const lower = (title || '').toLowerCase()
  if (!lower) return null
  return BRANDS.find((brand) => lower.includes(brand.toLowerCase())) ?? null
}

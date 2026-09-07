export const SPORTS_CATEGORY = 'MLC1276'

export const BRANDS = [
  'Ostrovit',
  'Muscletech',
  'Optimum',
  'Foodtech',
  'Gohard',
  'Overfit',
] as const

export const CATEGORIES = [
  { id: 'creatina', label: 'Creatina', query: 'creatina' },
  { id: 'proteina', label: 'Proteína', query: 'proteína whey' },
  { id: 'preentreno', label: 'Pre-entreno', query: 'pre entreno' },
  { id: 'pesas', label: 'Pesas', query: 'pesas' },
  { id: 'mancuernas', label: 'Mancuernas', query: 'mancuernas' },
  { id: 'shakers', label: 'Shakers', query: 'shaker' },
] as const

export const PRICE_PRESETS = [
  { id: 'all', label: 'Cualquier precio', min: null, max: null },
  { id: '15', label: 'Hasta $15.000', min: null, max: 15000 },
  { id: '15-30', label: '$15.000 – $30.000', min: 15000, max: 30000 },
  { id: '30-50', label: '$30.000 – $50.000', min: 30000, max: 50000 },
  { id: '50', label: 'Más de $50.000', min: 50000, max: null },
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

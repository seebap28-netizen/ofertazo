import type { Product, SearchParams } from '../types'

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
  { id: 'creatina', label: 'Creatina', query: 'creatina', terms: ['creatina', 'creatine', 'creapure'] },
  { id: 'proteina', label: 'Proteína', query: 'proteína', terms: ['proteina', 'proteína', 'protein', 'whey'] },
  { id: 'preentreno', label: 'Pre-entreno', query: 'pre entreno', terms: ['pre entreno', 'pre-entreno', 'preworkout', 'pre workout'] },
  { id: 'pesas', label: 'Pesas', query: 'pesas', terms: ['pesa', 'pesas', 'disco', 'barra'] },
  { id: 'mancuernas', label: 'Mancuernas', query: 'mancuernas', terms: ['mancuerna', 'mancuernas', 'dumbbell'] },
  { id: 'shakers', label: 'Shakers', query: 'shaker', terms: ['shaker', 'shakers', 'vaso'] },
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

function fold(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function filterGymProducts(products: Product[], filters: SearchParams) {
  const category = CATEGORIES.find((item) => item.id === filters.category)
  const query = fold(filters.q.trim())
  const brand = fold(filters.brand)

  let next = products.filter((product) => {
    const haystack = fold(`${product.title} ${product.officialStore || ''} ${product.brandHint || ''}`)
    const matchesBrand = !brand || haystack.includes(brand)
    const matchesCategory =
      !category || category.terms.some((term) => haystack.includes(fold(term)))
    const matchesQuery =
      !query || query.split(/\s+/).filter(Boolean).every((part) => haystack.includes(part))
    const matchesMin = filters.minPrice == null || product.price >= filters.minPrice
    const matchesMax = filters.maxPrice == null || product.price <= filters.maxPrice
    const matchesDeals = !filters.dealsOnly || Boolean(product.discountPercent)
    const matchesOfficial = !filters.officialOnly || Boolean(product.officialStore)
    return (
      matchesBrand &&
      matchesCategory &&
      matchesQuery &&
      matchesMin &&
      matchesMax &&
      matchesDeals &&
      matchesOfficial
    )
  })

  if (filters.sort === 'price_asc') next = [...next].sort((a, b) => a.price - b.price)
  if (filters.sort === 'price_desc') next = [...next].sort((a, b) => b.price - a.price)
  return next
}

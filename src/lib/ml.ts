import { CATEGORIES, SPORTS_CATEGORY } from './catalog'
import type { Product, SearchParams, SearchResponse } from '../types'

type MlItem = {
  id: string
  title: string
  price: number
  original_price?: number | null
  thumbnail?: string
  permalink: string
  shipping?: { free_shipping?: boolean }
  official_store_name?: string
  sold_quantity?: number
}

type MlSearch = {
  source?: 'live' | 'seed'
  paging?: { total?: number, offset?: number }
  results?: MlItem[]
}

function mapItem(item: MlItem): Product {
  const original = item.original_price ?? null
  const discount =
    original && original > item.price
      ? Math.round((1 - item.price / original) * 100)
      : null

  return {
    id: item.id,
    title: item.title || 'Producto',
    price: Number(item.price) || 0,
    originalPrice: original,
    discountPercent: discount,
    thumbnail: (item.thumbnail || '')
      .replace('http://', 'https://')
      .replace('-I.jpg', '-O.jpg'),
    permalink: item.permalink || `https://www.mercadolibre.cl/${item.id}`,
    freeShipping: Boolean(item.shipping?.free_shipping),
    officialStore: item.official_store_name || null,
    soldQuantity: item.sold_quantity ?? null,
    brandHint: null,
  }
}

export function buildQuery(params: SearchParams) {
  const categoryMeta = CATEGORIES.find((item) => item.id === params.category)
  const parts = [params.brand, categoryMeta?.query, params.q]
    .map((part) => part?.trim())
    .filter(Boolean)

  return parts.join(' ').trim()
}

export async function searchProducts(params: SearchParams): Promise<SearchResponse> {
  const search = new URLSearchParams()
  const q = buildQuery(params)
  if (q) search.set('q', q)
  search.set('category', SPORTS_CATEGORY)
  search.set('offset', String(params.offset))
  search.set('limit', '20')
  search.set('sort', params.sort)

  if (params.minPrice != null || params.maxPrice != null) {
    search.set(
      'price',
      `${params.minPrice ?? ''}-${params.maxPrice ?? ''}`,
    )
  }
  if (params.officialOnly) search.set('official_store', 'all')

  const response = await fetch(`/api/search?${search.toString()}`)
  if (!response.ok) {
    throw new Error('No pudimos cargar las ofertas. Inténtalo de nuevo.')
  }

  const data = (await response.json()) as MlSearch
  let results = (data.results || [])
    .map(mapItem)
    .filter((item) => item.title && item.permalink)

  if (params.dealsOnly) {
    results = results.filter((item) => item.discountPercent && item.discountPercent > 0)
  }

  return {
    results,
    total: data.paging?.total ?? results.length,
    offset: data.paging?.offset ?? params.offset,
    source: data.source === 'live' ? 'live' : 'seed',
  }
}

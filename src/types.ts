export type Product = {
  id: string
  title: string
  price: number
  originalPrice: number | null
  discountPercent: number | null
  thumbnail: string
  permalink: string
  freeShipping: boolean
  officialStore: string | null
  soldQuantity: number | null
  brandHint: string | null
}

export type SearchParams = {
  q: string
  brand: string
  category: string
  minPrice: number | null
  maxPrice: number | null
  dealsOnly: boolean
  officialOnly: boolean
  sort: 'relevance' | 'price_asc' | 'price_desc'
  offset: number
}

export type SearchResponse = {
  results: Product[]
  total: number
  offset: number
  source: 'live' | 'seed'
}

export type ClickEvent = {
  productId: string
  title: string
  brand: string
  price: number
  permalink: string
  at: number
}

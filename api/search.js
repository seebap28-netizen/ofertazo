import { seedProducts } from './seed.js'

const SITE = 'MLC'
const DEFAULT_CATEGORY = 'MLC1276'

function mapItem(item) {
  const original = item.original_price ?? null
  const discount =
    original && original > item.price
      ? Math.round((1 - item.price / original) * 100)
      : null

  return {
    id: item.id,
    title: item.title,
    price: item.price,
    original_price: original,
    thumbnail: String(item.thumbnail || '')
      .replace('http://', 'https://')
      .replace('-I.jpg', '-O.jpg'),
    permalink: item.permalink,
    shipping: item.shipping,
    official_store_name: item.official_store_name || null,
    sold_quantity: item.sold_quantity ?? null,
    discount,
  }
}

function filterSeed(searchParams) {
  const q = (searchParams.get('q') || '').toLowerCase()
  const price = searchParams.get('price')
  const officialStore = searchParams.get('official_store')
  const offset = Number(searchParams.get('offset') || 0)
  const limit = Number(searchParams.get('limit') || 20)
  const sort = searchParams.get('sort') || 'relevance'

  let [min, max] = (price || '-').split('-')
  min = min ? Number(min) : null
  max = max ? Number(max) : null

  let items = seedProducts.filter((item) => {
    const haystack = `${item.title} ${item.official_store_name || ''}`.toLowerCase()
    const matchesQuery = !q || q.split(/\s+/).every((part) => haystack.includes(part))
    const matchesMin = min == null || Number.isNaN(min) || item.price >= min
    const matchesMax = max == null || Number.isNaN(max) || item.price <= max
    const matchesOfficial = !officialStore || Boolean(item.official_store_name)
    return matchesQuery && matchesMin && matchesMax && matchesOfficial
  })

  if (sort === 'price_asc') items = [...items].sort((a, b) => a.price - b.price)
  if (sort === 'price_desc') items = [...items].sort((a, b) => b.price - a.price)

  return {
    source: 'seed',
    paging: { total: items.length, offset, limit },
    results: items.slice(offset, offset + limit).map(mapItem),
  }
}

async function fetchLive(searchParams) {
  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || DEFAULT_CATEGORY
  const offset = searchParams.get('offset') || '0'
  const limit = searchParams.get('limit') || '20'
  const sort = searchParams.get('sort') || 'relevance'
  const price = searchParams.get('price')
  const officialStore = searchParams.get('official_store')
  const token = process.env.ML_ACCESS_TOKEN

  const url = new URL(`https://api.mercadolibre.com/sites/${SITE}/search`)
  if (q) url.searchParams.set('q', q)
  url.searchParams.set('category', category)
  url.searchParams.set('offset', offset)
  url.searchParams.set('limit', limit)
  url.searchParams.set('sort', sort)
  if (price) url.searchParams.set('price', price)
  if (officialStore) url.searchParams.set('official_store', officialStore)

  const headers = {
    Accept: 'application/json',
    'User-Agent': 'Ofertazo/1.0 (affiliate catalog; Chile)',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(url, { headers })
  if (!response.ok) {
    const text = await response.text()
    const error = Object.assign(
      new Error(`Mercado Libre ${response.status}: ${text.slice(0, 180)}`),
      { status: response.status },
    )
    throw error
  }

  const data = await response.json()
  return {
    source: 'live',
    paging: data.paging,
    results: (data.results || []).map(mapItem),
  }
}

export async function runSearch(searchParams) {
  try {
    return await fetchLive(searchParams)
  } catch {
    return filterSeed(searchParams)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  try {
    const url = new URL(req.url, 'http://localhost')
    const payload = await runSearch(url.searchParams)
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300')
    res.status(200).json(payload)
  } catch (error) {
    res.status(error.status || 502).json({
      error: 'ml_unavailable',
      message: error.message,
    })
  }
}

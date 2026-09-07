import { seedProducts } from './seed.js'
import { getAccessToken } from './meliToken.js'

const SITE = 'MLC'
const DEFAULT_CATEGORY = 'MLC1276'

function mapItem(item) {
  const original = item.original_price ?? null
  const discount =
    original && original > item.price
      ? Math.round((1 - item.price / original) * 100)
      : null

  const thumbnailId = item.thumbnail_id
  const thumbnail = thumbnailId
    ? `https://http2.mlstatic.com/D_${thumbnailId}-O.jpg`
    : String(item.thumbnail || '')
        .replace('http://', 'https://')
        .replace('-I.jpg', '-O.jpg')

  return {
    id: item.id,
    title: item.title,
    price: item.price,
    original_price: original,
    thumbnail,
    permalink: item.permalink,
    shipping: item.shipping,
    official_store_name: item.official_store_name || null,
    sold_quantity: item.sold_quantity ?? null,
    discount,
  }
}

function authHeaders(token) {
  const headers = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

async function mlGet(path, token) {
  const response = await fetch(`https://api.mercadolibre.com${path}`, {
    headers: authHeaders(token),
  })
  const text = await response.text()
  if (!response.ok) {
    const error = Object.assign(
      new Error(`Mercado Libre ${response.status}: ${text.slice(0, 180)}`),
      { status: response.status },
    )
    throw error
  }
  return JSON.parse(text)
}

function filterSeed(searchParams) {
  const q = (searchParams.get('q') || '').toLowerCase()
  const price = searchParams.get('price')
  const officialStore = searchParams.get('official_store')
  const offset = Number(searchParams.get('offset') || 0)
  const limit = Number(searchParams.get('limit') || 48)
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

const GYM_NAME = /fitness|muscul|suplement|pesa|mancuerna|gimnas|cardio|funcional|shaker/i

async function categoryIds(token, rootId) {
  const category = await mlGet(`/categories/${rootId}`, token)
  const gymKids = (category.children_categories || []).filter((child) =>
    GYM_NAME.test(child.name || ''),
  )
  const ids = gymKids.map((child) => child.id)
  if (!ids.length) {
    return [rootId, ...(category.children_categories || []).map((child) => child.id)].slice(0, 20)
  }

  const grand = await Promise.all(
    ids.slice(0, 8).map(async (id) => {
      try {
        const nested = await mlGet(`/categories/${id}`, token)
        return (nested.children_categories || []).map((child) => child.id)
      } catch {
        return []
      }
    }),
  )

  return [...ids, ...grand.flat()].slice(0, 20)
}

async function highlightEntries(token, categoryId) {
  try {
    const data = await mlGet(`/highlights/${SITE}/category/${categoryId}`, token)
    return data.content || []
  } catch {
    return []
  }
}

function mapCatalogProduct(product, fallbackId) {
  const winner = product.buy_box_winner || product.buy_box || {}
  const picture =
    product.pictures?.[0]?.url ||
    product.pictures?.[0]?.secure_url ||
    product.secure_thumbnail ||
    product.thumbnail ||
    ''
  const price = Number(
    winner.price ?? product.price ?? product.original_price ?? product.buy_box_price,
  )
  return {
    id: winner.item_id || product.id || fallbackId,
    title: product.name || product.title || 'Oferta deportiva',
    price: Number.isFinite(price) ? price : 0,
    original_price: winner.original_price ?? product.original_price ?? null,
    thumbnail: String(picture).replace('http://', 'https://'),
    permalink:
      winner.permalink ||
      product.permalink ||
      `https://www.mercadolibre.cl/p/${product.id || fallbackId}`,
    shipping: { free_shipping: Boolean(winner.shipping?.free_shipping) },
    official_store_name: null,
    sold_quantity: product.sold_quantity ?? null,
  }
}

async function fetchCatalogProducts(token, productIds) {
  const unique = [...new Set(productIds)].slice(0, 60)
  const mapped = []
  for (let i = 0; i < unique.length; i += 10) {
    const chunk = unique.slice(i, i + 10)
    const batch = await Promise.all(
      chunk.map(async (id) => {
        const [product, listing] = await Promise.all([
          mlGet(`/products/${id}`, token).catch(() => ({ id, name: 'Oferta deportiva' })),
          mlGet(`/products/${id}/items`, token).catch(() => ({ results: [] })),
        ])
        const offers = [...(listing.results || [])].sort(
          (a, b) => Number(a.price || 0) - Number(b.price || 0),
        )
        const cheapest = offers.find((offer) => Number(offer.price) > 0)
        const row = mapCatalogProduct(product, id)
        if (cheapest) {
          row.price = Number(cheapest.price)
          row.original_price = cheapest.original_price ?? row.original_price
          row.id = cheapest.item_id || row.id
          if (cheapest.permalink) row.permalink = cheapest.permalink
          row.shipping = {
            free_shipping: Boolean(cheapest.shipping?.free_shipping || cheapest.free_shipping),
          }
        }
        return row
      }),
    )
    mapped.push(...batch)
  }
  return mapped
}

async function collectHighlights(token, categoryId) {
  const ids = await categoryIds(token, categoryId)
  const groups = await Promise.all(ids.map((id) => highlightEntries(token, id)))
  const entries = groups.flat()
  return {
    itemIds: entries.filter((row) => row.type === 'ITEM' && row.id).map((row) => row.id),
    productIds: entries.filter((row) => row.type === 'PRODUCT' && row.id).map((row) => row.id),
  }
}

async function fetchLive(searchParams) {
  const token = await getAccessToken()
  if (!token) {
    throw Object.assign(new Error('sin_token'), { status: 401 })
  }

  const root = searchParams.get('category') || DEFAULT_CATEGORY
  const { itemIds, productIds } = await collectHighlights(token, root)
  const [items, catalog] = await Promise.all([
    fetchItems(token, itemIds),
    fetchCatalogProducts(token, productIds),
  ])
  const all = [...catalog, ...items]
  if (!all.length) {
    return {
      source: 'live',
      paging: { total: 0, offset: 0, limit: 48 },
      results: [],
    }
  }
  return applyFilters(all, searchParams)
}

async function fetchItems(token, ids) {
  const unique = [...new Set(ids)].slice(0, 80)
  if (!unique.length) return []

  const chunks = []
  for (let i = 0; i < unique.length; i += 20) {
    chunks.push(unique.slice(i, i + 20))
  }

  const pages = await Promise.all(
    chunks.map((chunk) => mlGet(`/items?ids=${chunk.join(',')}`, token)),
  )

  return pages.flat().flatMap((row) => {
    const item = row.body || row
    if (!item?.id || !item.title || !item.price || item.status === 'closed') return []
    return [item]
  })
}

function applyFilters(items, searchParams) {
  const q = (searchParams.get('q') || '').toLowerCase()
  const price = searchParams.get('price')
  const officialStore = searchParams.get('official_store')
  const sort = searchParams.get('sort') || 'relevance'
  const offset = Number(searchParams.get('offset') || 0)
  const limit = Number(searchParams.get('limit') || 48)

  let [min, max] = (price || '-').split('-')
  min = min ? Number(min) : null
  max = max ? Number(max) : null

  let filtered = items.filter((item) => {
    const haystack = `${item.title || ''} ${item.official_store_name || ''}`.toLowerCase()
    const matchesQuery = !q || q.split(/\s+/).every((part) => haystack.includes(part))
    const matchesMin = min == null || Number.isNaN(min) || !item.price || item.price >= min
    const matchesMax = max == null || Number.isNaN(max) || !item.price || item.price <= max
    const matchesOfficial = !officialStore || Boolean(item.official_store_id || item.official_store_name)
    return matchesQuery && matchesMin && matchesMax && matchesOfficial
  })

  if (sort === 'price_asc') filtered = [...filtered].sort((a, b) => a.price - b.price)
  if (sort === 'price_desc') filtered = [...filtered].sort((a, b) => b.price - a.price)

  return {
    source: 'live',
    paging: { total: filtered.length, offset, limit },
    results: filtered.slice(offset, offset + limit).map(mapItem),
  }
}

export async function runSearch(searchParams) {
  const token = await getAccessToken()
  try {
    return await fetchLive(searchParams)
  } catch (error) {
    console.error('Búsqueda Mercado Libre falló', error)
    if (!token) {
      return {
        ...filterSeed(searchParams),
        reason: 'sin_token',
      }
    }
    throw error
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
    if (payload.source === 'live') {
      res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300')
    } else {
      res.setHeader('Cache-Control', 'no-store')
    }
    res.status(200).json(payload)
  } catch (error) {
    res.status(error.status || 502).json({
      error: 'ml_unavailable',
      message: error.message,
    })
  }
}

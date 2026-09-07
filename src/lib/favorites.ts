import type { Product } from '../types'

const KEY = 'ofertazo-favorites'

function read(): Product[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as Product[]
  } catch {
    return []
  }
}

function write(items: Product[]) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function listFavorites() {
  return read()
}

export function isFavorite(id: string) {
  return read().some((item) => item.id === id)
}

export function toggleFavorite(product: Product) {
  const current = read()
  const exists = current.some((item) => item.id === product.id)
  const next = exists
    ? current.filter((item) => item.id !== product.id)
    : [product, ...current]
  write(next)
  return next
}

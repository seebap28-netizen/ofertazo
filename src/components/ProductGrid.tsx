import { ProductCard } from './ProductCard'
import type { Product } from '../types'

type Props = {
  products: Product[]
  empty: string
  onFavoriteChange?: () => void
}

export function ProductGrid({ products, empty, onFavoriteChange }: Props) {
  if (!products.length) {
    return (
      <div className="rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center text-zinc-400">
        {empty}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onFavoriteChange={onFavoriteChange} />
      ))}
    </div>
  )
}

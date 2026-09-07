import { toAffiliateUrl } from '../lib/affiliate'
import { formatClp, inferBrand } from '../lib/catalog'
import { isFavorite, toggleFavorite } from '../lib/favorites'
import { trackClick } from '../lib/stats'
import type { Product } from '../types'
import { useState } from 'react'

type Props = {
  product: Product
  onFavoriteChange?: () => void
}

export function ProductCard({ product, onFavoriteChange }: Props) {
  const [saved, setSaved] = useState(() => isFavorite(product.id))
  const brand = inferBrand(product.title) || product.brandHint
  const href = toAffiliateUrl(product.permalink)

  async function openOffer() {
    await trackClick(product)
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  function onHeart() {
    toggleFavorite(product)
    setSaved(isFavorite(product.id))
    onFavoriteChange?.()
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
      <div className="relative aspect-square bg-white">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.title}
            className="h-full w-full object-contain p-4"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-500">Sin imagen</div>
        )}
        {product.discountPercent ? (
          <span className="absolute left-3 top-3 rounded-full bg-[#ff3b1f] px-3 py-1 text-xs font-bold">
            -{product.discountPercent}%
          </span>
        ) : null}
        <button
          type="button"
          onClick={onHeart}
          className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-2 text-lg"
          aria-label={saved ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        >
          {saved ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {brand ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ffd000]">{brand}</p>
        ) : null}
        <h3 className="line-clamp-2 min-h-12 text-base font-medium leading-snug">{product.title}</h3>
        <div>
          <p className="text-2xl font-bold">{formatClp(product.price)}</p>
          {product.originalPrice ? (
            <p className="text-sm text-zinc-500 line-through">{formatClp(product.originalPrice)}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
          {product.freeShipping ? (
            <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-300">Envío gratis</span>
          ) : null}
          {product.officialStore ? (
            <span className="rounded-full bg-white/10 px-2 py-1">Tienda oficial</span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={openOffer}
          className="mt-auto w-full rounded-2xl bg-[#ffd000] py-3 text-center text-sm font-extrabold tracking-wide text-black"
        >
          VER OFERTA
        </button>
      </div>
    </article>
  )
}

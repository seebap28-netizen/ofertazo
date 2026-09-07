import { useState } from 'react'
import { ProductGrid } from '../components/ProductGrid'
import { listFavorites } from '../lib/favorites'

export function Favorites() {
  const [items, setItems] = useState(() => listFavorites())

  return (
    <div className="space-y-6">
      <h1 className="logo-display text-5xl">Favoritos</h1>
      <p className="text-zinc-400">Guarda lo que te gusta y vuelve a comprarlo cuando quieras.</p>
      <ProductGrid
        products={items}
        empty="Todavía no tienes favoritos. Toca el corazón en cualquier producto."
        onFavoriteChange={() => setItems(listFavorites())}
      />
    </div>
  )
}

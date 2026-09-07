import { useEffect, useState } from 'react'
import { Filters } from '../components/Filters'
import { ProductGrid } from '../components/ProductGrid'
import { DEFAULT_SEARCH } from '../lib/catalog'
import { searchProducts } from '../lib/ml'
import type { Product, SearchParams } from '../types'

export function Home() {
  const [filters, setFilters] = useState<SearchParams>(DEFAULT_SEARCH)
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load(next = filters, append = false) {
    setLoading(true)
    setError('')
    try {
      const data = await searchProducts(next)
      setProducts((current) => (append ? [...current, ...data.results] : data.results))
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos cargar las ofertas')
      if (!append) setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load(DEFAULT_SEARCH)
  }, [])

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#1a1208] to-black p-6 sm:p-10">
        <p className="text-sm uppercase tracking-[0.25em] text-[#ffd000]">Chile</p>
        <h1 className="logo-display mt-2 text-5xl leading-none sm:text-7xl">Ofertas deportivas</h1>
        <p className="mt-4 max-w-2xl text-zinc-300">
          Nike, Adidas, Puma, New Balance, Under Armour y Columbia. Zapatillas, ropa y accesorios con el
          mejor precio del momento.
        </p>
      </section>

      <Filters
        value={filters}
        onChange={setFilters}
        onSubmit={() => void load({ ...filters, offset: 0 })}
      />

      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="logo-display text-4xl">🔥 Ofertas deportivas</h2>
          <p className="text-sm text-zinc-400">
            {total.toLocaleString('es-CL')} productos disponibles
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {loading && !products.length ? (
        <p className="text-zinc-400">Cargando ofertas...</p>
      ) : (
        <ProductGrid products={products} empty="No encontramos productos con esos filtros." />
      )}

      {products.length > 0 && products.length < total ? (
        <div className="flex justify-center">
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              const next = { ...filters, offset: products.length }
              setFilters(next)
              void load(next, true)
            }}
            className="rounded-full border border-white/20 px-6 py-3 text-sm"
          >
            {loading ? 'Cargando...' : 'Ver más ofertas'}
          </button>
        </div>
      ) : null}
    </div>
  )
}

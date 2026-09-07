import { useEffect, useMemo, useState } from 'react'
import { Filters } from '../components/Filters'
import { ProductGrid } from '../components/ProductGrid'
import { DEFAULT_SEARCH, filterGymProducts } from '../lib/catalog'
import { searchProducts } from '../lib/ml'
import type { Product, SearchParams } from '../types'

export function Home() {
  const [filters, setFilters] = useState<SearchParams>(DEFAULT_SEARCH)
  const [catalog, setCatalog] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const products = useMemo(() => filterGymProducts(catalog, filters), [catalog, filters])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await searchProducts(DEFAULT_SEARCH)
        setCatalog(data.results)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No pudimos cargar las ofertas')
        setCatalog([])
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#1a1208] to-black p-6 sm:p-10">
        <p className="text-sm uppercase tracking-[0.25em] text-[#ffd000]">Gym · Chile</p>
        <h1 className="logo-display mt-2 text-5xl leading-none sm:text-7xl">Ofertas gym</h1>
        <p className="mt-4 max-w-2xl text-zinc-300">
          Creatina, proteína, pre-entreno, pesas y mancuernas. Lo que usas en el gym, al mejor precio
          del momento.
        </p>
      </section>

      <Filters
        value={filters}
        onChange={setFilters}
        onSubmit={() => setFilters((current) => ({ ...current, offset: 0 }))}
      />

      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="logo-display text-4xl">🔥 Ofertas gym</h2>
          <p className="text-sm text-zinc-400">
            {products.length.toLocaleString('es-CL')} productos para tu entrenamiento
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {loading && !catalog.length ? (
        <p className="text-zinc-400">Cargando ofertas gym...</p>
      ) : (
        <ProductGrid products={products} empty="No encontramos productos con esos filtros." />
      )}
    </div>
  )
}

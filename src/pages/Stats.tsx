import { useEffect, useMemo, useState } from 'react'
import { formatClp } from '../lib/catalog'
import { loadClicks } from '../lib/stats'
import type { ClickEvent } from '../types'

export function Stats() {
  const [clicks, setClicks] = useState<ClickEvent[]>([])

  useEffect(() => {
    void loadClicks().then(setClicks)
  }, [])

  const byBrand = useMemo(() => {
    const map = new Map<string, number>()
    for (const click of clicks) {
      map.set(click.brand, (map.get(click.brand) || 0) + 1)
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [clicks])

  return (
    <div className="space-y-6">
      <h1 className="logo-display text-5xl">Actividad</h1>
      <p className="text-zinc-400">Tus ofertas vistas recientemente.</p>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-white/10 p-5">
          <p className="text-sm text-zinc-500">Clics</p>
          <p className="text-4xl font-bold">{clicks.length}</p>
        </div>
        <div className="rounded-3xl border border-white/10 p-5">
          <p className="text-sm text-zinc-500">Marcas tocadas</p>
          <p className="text-4xl font-bold">{byBrand.length}</p>
        </div>
        <div className="rounded-3xl border border-white/10 p-5">
          <p className="text-sm text-zinc-500">Valor clickeado</p>
          <p className="text-4xl font-bold">
            {formatClp(clicks.reduce((sum, item) => sum + item.price, 0))}
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-white/10 p-5">
        <h2 className="mb-4 text-lg font-semibold">Por marca</h2>
        <ul className="space-y-2">
          {byBrand.map(([brand, count]) => (
            <li key={brand} className="flex justify-between text-sm">
              <span>{brand}</span>
              <span className="text-[#ffd000]">{count}</span>
            </li>
          ))}
          {!byBrand.length ? <li className="text-zinc-500">Aún no hay clics.</li> : null}
        </ul>
      </section>

      <section className="rounded-3xl border border-white/10 p-5">
        <h2 className="mb-4 text-lg font-semibold">Últimos clics</h2>
        <div className="space-y-3">
          {clicks.slice(0, 20).map((click) => (
            <div key={`${click.productId}-${click.at}`} className="border-b border-white/5 pb-3">
              <p className="font-medium">{click.title}</p>
              <p className="text-sm text-zinc-500">
                {click.brand} · {formatClp(click.price)} · {new Date(click.at).toLocaleString('es-CL')}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

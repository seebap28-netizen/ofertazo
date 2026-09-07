import { BRANDS, CATEGORIES, PRICE_PRESETS } from '../lib/catalog'
import type { SearchParams } from '../types'

type Props = {
  value: SearchParams
  onChange: (next: SearchParams) => void
  onSubmit: () => void
}

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm ${
        active ? 'bg-[#ffd000] font-bold text-black' : 'bg-white/8 text-zinc-200 hover:bg-white/12'
      }`}
    >
      {children}
    </button>
  )
}

export function Filters({ value, onChange, onSubmit }: Props) {
  return (
    <section className="space-y-5">
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <input
          value={value.q}
          onChange={(event) => onChange({ ...value, q: event.target.value, offset: 0 })}
          placeholder="Busca zapatillas, Nike Air Max, running..."
          className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-5 py-4 outline-none ring-[#ffd000] focus:ring-2"
        />
        <button
          type="submit"
          className="rounded-2xl bg-[#ff3b1f] px-6 py-4 font-bold"
        >
          Buscar
        </button>
      </form>

      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-zinc-500">Marcas</p>
        <div className="flex flex-wrap gap-2">
          <Chip active={!value.brand} onClick={() => onChange({ ...value, brand: '', offset: 0 })}>
            Todas
          </Chip>
          {BRANDS.map((brand) => (
            <Chip
              key={brand}
              active={value.brand === brand}
              onClick={() => onChange({ ...value, brand: value.brand === brand ? '' : brand, offset: 0 })}
            >
              {brand}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-zinc-500">Categorías</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <Chip
              key={category.id}
              active={value.category === category.id}
              onClick={() =>
                onChange({
                  ...value,
                  category: value.category === category.id ? '' : category.id,
                  offset: 0,
                })
              }
            >
              {category.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-zinc-500">Precio</p>
        <div className="flex flex-wrap gap-2">
          {PRICE_PRESETS.map((preset) => (
            <Chip
              key={preset.id}
              active={value.minPrice === preset.min && value.maxPrice === preset.max}
              onClick={() =>
                onChange({ ...value, minPrice: preset.min, maxPrice: preset.max, offset: 0 })
              }
            >
              {preset.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={value.dealsOnly}
            onChange={(event) => onChange({ ...value, dealsOnly: event.target.checked, offset: 0 })}
          />
          Solo con descuento
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={value.officialOnly}
            onChange={(event) => onChange({ ...value, officialOnly: event.target.checked, offset: 0 })}
          />
          Tiendas oficiales
        </label>
        <select
          value={value.sort}
          onChange={(event) =>
            onChange({ ...value, sort: event.target.value as SearchParams['sort'], offset: 0 })
          }
          className="rounded-full border border-white/10 bg-zinc-950 px-3 py-2 text-sm"
        >
          <option value="relevance">Relevancia</option>
          <option value="price_asc">Precio: menor a mayor</option>
          <option value="price_desc">Precio: mayor a menor</option>
        </select>
      </div>
    </section>
  )
}

import { Link, NavLink } from 'react-router-dom'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-2 text-sm ${isActive ? 'bg-white text-black' : 'text-zinc-300 hover:text-white'}`

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="logo-display text-3xl text-[#ffd000]">
          OFERTAZO
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto whitespace-nowrap">
          <NavLink to="/" className={navClass} end>
            Ofertas
          </NavLink>
          <NavLink to="/favoritos" className={navClass}>
            Favoritos
          </NavLink>
          <NavLink to="/ayuda" className={navClass}>
            Ayuda
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

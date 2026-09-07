import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { Favorites } from './pages/Favorites'
import { Home } from './pages/Home'
import { Help } from './pages/HowItWorks'
import { Stats } from './pages/Stats'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/favoritos" element={<Favorites />} />
            <Route path="/ayuda" element={<Help />} />
            <Route path="/como-funciona" element={<Help />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </main>
        <footer className="mx-auto max-w-6xl px-4 pb-10 text-sm text-zinc-500">
          <p>© {new Date().getFullYear()} Ofertazo · Ofertas gym en Chile</p>
          <p className="mt-1">Suplementos y equipo · Envíos a todo el país</p>
        </footer>
      </div>
    </BrowserRouter>
  )
}

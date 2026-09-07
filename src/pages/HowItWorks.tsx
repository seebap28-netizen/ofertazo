export function Help() {
  const steps = [
    { title: 'Elige tu suplemento o equipo', text: 'Filtra por creatina, proteína, pesas o el precio que te calza.' },
    { title: 'Revisa la oferta', text: 'Compara el valor, el descuento y si tiene envío gratis.' },
    { title: 'Compra en un clic', text: 'Toca VER OFERTA y termina tu pedido de forma segura.' },
    { title: 'Llega a tu casa', text: 'El vendedor despacha a todo Chile. Tú entrenas.' },
  ]

  return (
    <div className="space-y-8">
      <h1 className="logo-display text-5xl">Ayuda</h1>
      <p className="max-w-2xl text-zinc-300">
        Ofertazo junta ofertas de gym en Chile: suplementos, creatina, proteína y pesas. Comparas y
        compras al toque.
      </p>

      <ol className="grid gap-4 sm:grid-cols-2">
        {steps.map((step, index) => (
          <li key={step.title} className="rounded-3xl border border-white/10 p-5">
            <p className="text-sm text-[#ffd000]">0{index + 1}</p>
            <h2 className="mt-2 text-xl font-semibold">{step.title}</h2>
            <p className="mt-2 text-zinc-400">{step.text}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

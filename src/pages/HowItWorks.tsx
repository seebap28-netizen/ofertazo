export function Help() {
  const steps = [
    { title: 'Elige tu producto', text: 'Filtra por marca, categoría o precio y encuentra lo que buscas.' },
    { title: 'Revisa la oferta', text: 'Compara el precio, el descuento y si tiene envío gratis.' },
    { title: 'Compra en un clic', text: 'Toca VER OFERTA y termina tu pedido de forma segura.' },
    { title: 'Recíbelo en casa', text: 'El vendedor despacha a todo Chile. Tú no haces nada más.' },
  ]

  return (
    <div className="space-y-8">
      <h1 className="logo-display text-5xl">Ayuda</h1>
      <p className="max-w-2xl text-zinc-300">
        Ofertazo reúne ofertas deportivas para que compares y compres más rápido. Precios actualizados,
        marcas que ya conoces y envíos a todo Chile.
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

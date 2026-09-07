# Ofertazo

Buscador de ofertas deportivas en Chile, pensado para el Programa de Afiliados de Mercado Libre.

Flujo: **tu web → VER OFERTA → Mercado Libre → compra → comisión**. No hay stock, despacho ni cobro al cliente.

## Qué incluye

- Buscador sobre la categoría Deportes y Fitness (MLC1276)
- Filtros por marca, categoría, precio, descuento y tiendas oficiales
- Imágenes, precios en CLP y botón VER OFERTA
- Favoritos en el navegador
- Estadísticas de clics (local o Firebase)
- Diseño mobile-first
- Proxy `/api/search` para Vercel y para `npm run dev`

Mercado Libre no entrega API oficial de afiliados. El catálogo sale de la API pública de búsqueda; el tracking se agrega con `matt_tool` y `matt_word` de un link que tú generas en la Central de Afiliados.

Si la API responde 403, el sitio usa un catálogo de demostración. Para datos en vivo crea una app en [developers.mercadolibre.com](https://developers.mercadolibre.com) y guarda `ML_ACCESS_TOKEN` en Vercel / `.env`.

## Arranque local

```bash
npm install
copy .env.example .env
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

## Cobrar comisión

1. Inscríbete en [Afiliados Mercado Libre Chile](https://www.mercadolibre.cl/l/afiliados)
2. Genera un link de cualquier producto
3. Copia `matt_tool` y `matt_word` a `.env`:

```
VITE_ML_MATT_TOOL=12345678
VITE_ML_MATT_WORD=tu_usuario
```

Sin esas variables el sitio igual funciona, pero Mercado Libre no te atribuye la venta.

## Firebase (opcional)

Crea un proyecto, habilita Firestore y pega las keys `VITE_FIREBASE_*`. Crea una colección `clicks` (se escribe sola al primer clic). Reglas de ejemplo para arrancar:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clicks/{id} {
      allow read, create: if true;
    }
  }
}
```

Ajusta las reglas antes de un tráfico real.

## Deploy en Vercel

```bash
npx vercel
```

Carga las mismas variables de entorno en el dashboard de Vercel.

## Después

- Automatizar ingestión de productos a Firestore
- Sumar redes como Awin (Nike y otras marcas globales)
- No construir el negocio atado solo a una marca

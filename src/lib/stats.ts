import { getDb } from './firebase'
import type { ClickEvent, Product } from '../types'
import { inferBrand } from './catalog'

const LOCAL_KEY = 'ofertazo-clicks'

function readLocal(): ClickEvent[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]') as ClickEvent[]
  } catch {
    return []
  }
}

function writeLocal(events: ClickEvent[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(events.slice(0, 500)))
}

export async function trackClick(product: Product) {
  const event: ClickEvent = {
    productId: product.id,
    title: product.title,
    brand: inferBrand(product.title) || product.brandHint || 'Otro',
    price: product.price,
    permalink: product.permalink,
    at: Date.now(),
  }

  writeLocal([event, ...readLocal()])

  const db = await getDb()
  if (db) {
    try {
      const { addDoc, collection } = await import('firebase/firestore')
      await addDoc(collection(db, 'clicks'), event)
    } catch (error) {
      console.warn('No se pudo guardar el clic en Firebase', error)
    }
  }

  return event
}

export async function loadClicks(): Promise<ClickEvent[]> {
  const db = await getDb()
  if (db) {
    try {
      const { collection, getDocs, limit, orderBy, query } = await import('firebase/firestore')
      const snap = await getDocs(
        query(collection(db, 'clicks'), orderBy('at', 'desc'), limit(400)),
      )
      return snap.docs.map((doc) => doc.data() as ClickEvent)
    } catch (error) {
      console.warn('No se pudieron leer clics de Firebase', error)
    }
  }
  return readLocal()
}

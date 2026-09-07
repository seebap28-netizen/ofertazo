import { createHash, randomBytes } from 'node:crypto'

let cached = { token: '', expiresAt: 0 }

export function publicBaseUrl() {
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const deployment = process.env.VERCEL_URL
  const host = production || deployment
  if (host) return `https://${host.replace(/^https?:\/\//, '')}`
  return 'http://localhost:5173'
}

export function redirectUri() {
  return `${publicBaseUrl()}/api/meli-callback`
}

export function createPkce() {
  const verifier = randomBytes(32).toString('base64url')
  const challenge = createHash('sha256').update(verifier).digest('base64url')
  return { verifier, challenge }
}

export function readCookie(req, name) {
  const raw = req.headers.cookie || ''
  const match = raw.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : ''
}

export async function exchangeCode(code, codeVerifier) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: process.env.ML_CLIENT_ID || '',
    client_secret: process.env.ML_CLIENT_SECRET || '',
    code,
    redirect_uri: redirectUri(),
  })
  if (codeVerifier) body.set('code_verifier', codeVerifier)

  const response = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  return response.json()
}

export async function getAccessToken() {
  if (process.env.ML_ACCESS_TOKEN) return process.env.ML_ACCESS_TOKEN

  if (cached.token && Date.now() < cached.expiresAt) return cached.token

  const refresh = process.env.ML_REFRESH_TOKEN
  const clientId = process.env.ML_CLIENT_ID
  const clientSecret = process.env.ML_CLIENT_SECRET
  if (!refresh || !clientId || !clientSecret) return null

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refresh,
  })

  const response = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  const data = await response.json()
  if (!data.access_token) {
    console.error('No se pudo renovar el token de Mercado Libre', data)
    return null
  }

  cached = {
    token: data.access_token,
    expiresAt: Date.now() + Math.max((data.expires_in || 21600) - 120, 60) * 1000,
  }
  return cached.token
}

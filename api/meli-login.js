import { createPkce, redirectUri } from './meliToken.js'

export default async function handler(req, res) {
  const clientId = process.env.ML_CLIENT_ID
  if (!clientId) {
    res.status(500).send('Falta ML_CLIENT_ID en las variables de Vercel.')
    return
  }

  const { verifier, challenge } = createPkce()
  const url = new URL('https://auth.mercadolibre.cl/authorization')
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri())
  url.searchParams.set('code_challenge', challenge)
  url.searchParams.set('code_challenge_method', 'S256')
  url.searchParams.set('scope', 'offline_access read')

  res.setHeader('Set-Cookie', [
    `ml_pkce=${encodeURIComponent(verifier)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
  ])
  res.writeHead(302, { Location: url.toString() })
  res.end()
}

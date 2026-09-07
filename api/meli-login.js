import { redirectUri } from './meliToken.js'

export default async function handler(req, res) {
  const clientId = process.env.ML_CLIENT_ID
  if (!clientId) {
    res.status(500).send('Falta ML_CLIENT_ID en las variables de Vercel.')
    return
  }

  const url = new URL('https://auth.mercadolibre.cl/authorization')
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri())

  res.writeHead(302, { Location: url.toString() })
  res.end()
}

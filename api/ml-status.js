import { cleanSecret, getAccessToken } from './meliToken.js'

export default async function handler(req, res) {
  const token = await getAccessToken()
  const suffix = token ? token.slice(-8) : null
  let ml = null

  if (token) {
    const response = await fetch(
      'https://api.mercadolibre.com/sites/MLC/search?q=nike&limit=1',
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )
    const text = await response.text()
    ml = {
      status: response.status,
      body: text.slice(0, 300),
    }
  }

  res.setHeader('Cache-Control', 'no-store')
  res.status(200).json({
    hasAccessToken: Boolean(token),
    tokenEndsWith: suffix,
    hasClientId: Boolean(cleanSecret(process.env.ML_CLIENT_ID)),
    hasClientSecret: Boolean(cleanSecret(process.env.ML_CLIENT_SECRET)),
    hasRefreshToken: Boolean(cleanSecret(process.env.ML_REFRESH_TOKEN)),
    mercadoLibre: ml,
  })
}

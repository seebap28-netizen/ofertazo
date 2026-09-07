import { cleanSecret, getAccessToken } from './meliToken.js'

async function probe(path, token) {
  const response = await fetch(`https://api.mercadolibre.com${path}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  const text = await response.text()
  return { path, status: response.status, body: text.slice(0, 180) }
}

export default async function handler(req, res) {
  const token = await getAccessToken()
  const checks = token
    ? await Promise.all([
        probe('/users/me', token),
        probe('/sites/MLC/search?q=nike&limit=1', token),
        probe('/highlights/MLC/category/MLC1276', token),
        probe('/categories/MLC1276', token),
        probe('/products/MLC23892420', token),
        probe('/products/MLC23892420/items', token),
      ])
    : []

  res.setHeader('Cache-Control', 'no-store')
  res.status(200).json({
    hasAccessToken: Boolean(token),
    tokenEndsWith: token ? token.slice(-8) : null,
    hasClientId: Boolean(cleanSecret(process.env.ML_CLIENT_ID)),
    hasClientSecret: Boolean(cleanSecret(process.env.ML_CLIENT_SECRET)),
    hasRefreshToken: Boolean(cleanSecret(process.env.ML_REFRESH_TOKEN)),
    checks,
  })
}

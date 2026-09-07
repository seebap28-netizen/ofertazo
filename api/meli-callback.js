import { exchangeCode, readCookie } from './meliToken.js'

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost')
  const code = url.searchParams.get('code')
  if (!code) {
    res.status(400).send('Falta el code de Mercado Libre. Entra por /api/meli-login, no abras esta URL a mano.')
    return
  }

  const verifier = readCookie(req, 'ml_pkce')
  const data = await exchangeCode(code, verifier)
  const token = data.refresh_token || ''
  const access = data.access_token || ''
  const error = data.message || data.error || ''

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.status(200).send(`<!doctype html>
<html lang="es">
  <body style="font-family:sans-serif;max-width:720px;margin:40px auto;line-height:1.5">
    <h1>Conexión con Mercado Libre</h1>
    ${
      token
        ? `<p>Copia estos valores en Vercel → Settings → Environment Variables y vuelve a hacer Deploy:</p>
           <p><b>ML_REFRESH_TOKEN</b></p>
           <textarea style="width:100%;height:90px">${token}</textarea>
           <p><b>ML_ACCESS_TOKEN</b> (opcional, se renueva solo con el refresh)</p>
           <textarea style="width:100%;height:90px">${access}</textarea>
           <p>Después de guardarlas, Redeploy. Las ofertas y fotos pasan a ser las de Mercado Libre Chile.</p>`
        : `<p>No se pudo obtener el token.</p><pre>${error || JSON.stringify(data, null, 2)}</pre>
           <p>Vuelve a entrar por <a href="/api/meli-login">/api/meli-login</a> (no recargues esta página: el code solo sirve una vez).</p>`
    }
  </body>
</html>`)
}

import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { runSearch } from './api/search.js'

function mercadoLibreDevApi(): Plugin {
  return {
    name: 'mercadolibre-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split('?')[0]
        if (path !== '/api/search') {
          next()
          return
        }

        try {
          const url = new URL(req.url || '/', 'http://localhost')
          const payload = await runSearch(url.searchParams)
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(payload))
        } catch (error) {
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: 'ml_unavailable',
              message: error instanceof Error ? error.message : 'Unknown error',
            }),
          )
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (env.ML_ACCESS_TOKEN) process.env.ML_ACCESS_TOKEN = env.ML_ACCESS_TOKEN

  return {
    plugins: [react(), tailwindcss(), mercadoLibreDevApi()],
  }
})

// Tiny static server for the front end in development. Proxies /api to the Express backend.
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.CLIENT_PORT || 5173
const API = process.env.API_URL || 'http://localhost:3001'

const app = express()
app.use('/api', createProxyMiddleware({
  target: API,
  changeOrigin: true,
  pathRewrite: (p) => '/api' + p,
  on: {
    error: (_err, _req, res) => {
      if (res.writeHead) { res.writeHead(502, { 'Content-Type': 'application/json' }); res.end('{"error":"API unavailable"}') }
    },
  },
}))
app.use(express.static(root, { etag: true, maxAge: 0, index: 'index.html', extensions: ['html'] }))
app.listen(PORT, () => console.log(`Alpine Ascents front end on http://localhost:${PORT}`))

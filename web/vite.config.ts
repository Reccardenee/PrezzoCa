import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { existsSync, readFileSync } from 'fs'
import { join, resolve } from 'path'
import type { Connect } from 'vite'

function dataPlugin(): { name: string; configureServer(server: { middlewares: Connect.Server }): void } {
  const dataDir = resolve(__dirname, '..', 'data')
  return {
    name: 'data-server',
    configureServer(server) {
      server.middlewares.use('/data', (req, res) => {
        const file = join(dataDir, req.url?.split('?')[0] ?? '')
        if (existsSync(file)) {
          res.setHeader('Content-Type', 'application/json')
          res.end(readFileSync(file))
        } else {
          res.statusCode = 404
          res.end('{}')
        }
      })
    },
  }
}

export default defineConfig({
  base: '/PrezziCa/',
  plugins: [react(), tailwindcss(), dataPlugin()],
})
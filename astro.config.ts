// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
import image from '@astrojs/image'

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx(), image()],
  vite: {
    ssr: {
      noExternal: ['fsevents'],
    },
    optimizeDeps: {
      exclude: ['fsevents'],
    },
    resolve: {
      alias: {
        fs: 'node:fs',
        path: 'node:path',
        events: 'node:events',
      }
    }
  },
})

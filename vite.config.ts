import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    /*
     * Block diagrams and floorplans are SVG data URIs rather than image files,
     * so nothing here needs inlining; datasheets and layout previews in
     * public/ are copied verbatim and must stay out of the JS bundle.
     */
    assetsInlineLimit: 0,
  },
  server: {
    port: 5173,
    proxy: {
      /*
       * The Express API runs as a separate process in development. Licence
       * files are streamed through this route, never from public/, so the
       * entitlement check in server/routes/library.ts cannot be bypassed by
       * guessing a URL.
       */
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
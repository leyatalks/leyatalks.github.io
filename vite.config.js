import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['leyalogo.png', 'vite.svg'],
      manifest: {
        name: '樂壓Talks',
        short_name: '樂壓Talks',
        description: '樂壓Talks',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: 'leyatalks.com',
        icons: [
          {
            src: '/leyalogo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/leyalogo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  base: '/',
})

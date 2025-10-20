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
      includeAssets: ['leyalogo.png', 'vite.svg', 'save-image.html'],
      workbox: {
        // 讓直接造訪 /save-image.html 不被當成 SPA 導向 index.html
        navigateFallbackDenylist: [/^\/save-image\.html$/],
      },
      manifest: {
        name: '樂壓Talks',
        short_name: '樂壓Talks',
        description: '樂壓Talks',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
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
  // 若日後需要部署到子路徑（如 /repo-name/），請改為 base: '/repo-name/'
  base: '/',
})

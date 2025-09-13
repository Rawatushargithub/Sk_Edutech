import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true
      },
      workbox: {
        // Precache app shell + critical assets only; images will be runtime-cached
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: '/index.html',
        // Allow larger app bundles to be precached if needed
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // 6 MiB
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
      manifest: {
        name: 'SK Edutech',
        short_name: 'SK Edu',
        description: 'SK Edutech Progressive Web App',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#7c3aed',
        background_color: '#ffffff',
        icons: [
          { src: '/assets/Logo.jpg', sizes: '192x192', type: 'image/jpeg', purpose: 'any' },
          { src: '/assets/LogoSolo.jpeg', sizes: '512x512', type: 'image/jpeg', purpose: 'any' }
        ]
      }
    })
  ],
  base: '/',
})


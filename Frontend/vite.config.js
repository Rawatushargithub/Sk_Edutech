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
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
        navigateFallback: '/index.html',
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
          { src: '/assets/Logo.jpg', sizes: '192x192', type: 'image/jpeg', purpose: 'any maskable' },
          { src: '/assets/LogoSolo.jpeg', sizes: '512x512', type: 'image/jpeg', purpose: 'any maskable' }
        ]
      }
    })
  ],
  base: '/',
})


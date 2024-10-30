import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'route-finder.csv', // Cache your CSV file
        'favicon.svg',
        'robots.txt', // Optional: Allow search engines to crawl your PWA
        'AppImages/android/android-launchericon-192-192.png',
        'AppImages/android/android-launchericon-512-512.png', // Add primary icons only
        'AppImages/ios/1024.png'
      ],
      manifest: {
        name: 'Climbing Route Finder',
        short_name: 'RouteFinder',
        description: 'An offline-first PWA for filtering climbing routes.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/', // Ensure the app starts from the root
        icons: [
          {
            src: 'AppImages/android/android-launchericon-192-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'AppImages/android/android-launchericon-512-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'AppImages/ios/1024.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,csv}'], // Cache necessary resources
        runtimeCaching: [
          {
            urlPattern: /\/route-finder\.csv$/, // Cache your CSV file
            handler: 'NetworkFirst',
            options: {
              cacheName: 'csv-cache',
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 24 * 60 * 60 // Cache for one day
              }
            }
          },
          {
            urlPattern: ({ request }) =>
                request.destination === 'document' || request.destination === 'script',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-js-cache'
            }
          },
          {
            urlPattern: ({ request }) =>
                request.destination === 'style' || request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets-cache'
            }
          }
        ]
      }
    })
  ]
});

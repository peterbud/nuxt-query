import { createResolver } from 'nuxt/kit'

const resolver = createResolver(import.meta.url)
export default defineNuxtConfig({
  modules: [
    '@unocss/nuxt',
  ],
  ssr: false,
  app: {
    baseURL: '/__nuxt-query-client',
  },
  css: [
    'vue-json-pretty/lib/styles.css',
  ],
  devServer: {
    port: 3300,
  },
  future: {
    compatibilityVersion: 4,
  },
  experimental: {
    viteEnvironmentApi: true,
  },
  nitro: {
    output: {
      publicDir: resolver.resolve('../dist/client'),
    },
  },
  vite: {
    optimizeDeps: {
      include: [
        '@tanstack/vue-query',
        'vue-json-pretty',
      ],
    },
  },
  unocss: {
    icons: {
      scale: 1.2,
      extraProperties: {
        'color': 'inherit',
        // Avoid crushing of icons in crowded situations
        'min-width': '1.2em',
      },
    },
  },
})

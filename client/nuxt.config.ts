import { createResolver } from 'nuxt/kit'

const resolver = createResolver(import.meta.url)
export default defineNuxtConfig({
  modules: [
    '@nuxt/devtools-ui-kit',
  ],
  ssr: false,
  app: {
    baseURL: '/__nuxt-query-client',
  },
  devServer: {
    port: 3300,
  },
  future: {
    compatibilityVersion: 4,
  },
  nitro: {
    output: {
      publicDir: resolver.resolve('../dist/client'),
    },
  },
})

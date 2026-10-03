import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  routeRules: {
    '/swr': { swr: 60 },
    '/isr': { isr: 60 },
    '/empty': { swr: 60 },
    '/client': { ssr: false },
    '/stream': { streaming: true },
  },
  experimental: {
    payloadExtraction: 'client',
    ssrStreaming: true,
  },
  nitro: {
    externals: {
      inline: ['vue', 'vue-router', '@vue/server-renderer'],
    },
  },
  nuxtQuery: {
    devtools: false,
  },
})

export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },

  nuxtQuery: {
    autoImports: ['useQuery'],
  },

  compatibilityDate: '2025-02-14',
})

export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  compatibilityDate: '2025-02-14',
  nuxtQuery: {
    autoImports: ['useQuery'],
    queryClientOptions: {
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          refetchInterval: 5000,
        },
      },
    },
  },
})

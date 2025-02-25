export default defineNuxtConfig({
  modules: [
    '../src/module',
  ],
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2025-02-14',
  nuxtQuery: {
    autoImports: ['useQuery', 'useMutation', 'useQueryClient'],
    queryClientOptions: {
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
        },
      },
    },
  },
})

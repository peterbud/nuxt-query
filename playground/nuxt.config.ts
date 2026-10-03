export default defineNuxtConfig({
  modules: [
    '../src/module',
  ],
  devtools: { enabled: true },
  routeRules: {
    '/payload-demo/**': { swr: 60 },
  },
  future: {
    compatibilityVersion: 4,
  },
  experimental: {
    payloadExtraction: 'client',
  },
  compatibilityDate: '2025-02-14',
  vite: {
    optimizeDeps: {
      include: [
        '@tanstack/vue-query',
      ],
    },
  },
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

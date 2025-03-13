// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@peterbud/nuxt-query'],
  devtools: { enabled: true },
  compatibilityDate: '2024-11-01',
  nuxtQuery: {
    autoImports: ['useQuery', 'useMutation', 'useQueryClient'],
  },
})

import { QueryClient, QueryCache } from '@tanstack/vue-query'

export default defineNuxtPlugin({
  name: 'nuxt-query-playground:plugin',
  enforce: 'pre',
  setup(nuxtApp) {
    nuxtApp.hook('nuxt-query:configure', (getPluginOptions) => {
      const clientOptions = useRuntimeConfig().public.nuxtQuery?.queryClientOptions || {}

      // create custom query cache
      // e.g for centrally logging successful or failed queries
      const queryClient = new QueryClient({
        ...clientOptions,
        queryCache: new QueryCache({
          // onSuccess: (data: unknown) => console.log('onSuccess', { data }),
          onError: (error: unknown) => console.error('Query failed:', { error }),
        }),
      })

      getPluginOptions(queryClient)
    })
  },
})

// import type{ ClientOptions } from '@tanstack/vue-query'

import { QueryClient, QueryCache } from '@tanstack/vue-query'

export default defineNuxtPlugin({
  name: 'nuxt-query-playground:plugin',
  enforce: 'pre',
  setup(nuxtApp) {
    nuxtApp.hook('nuxt-query:configure', (getPluginOptions) => {
      const clientOptions = useRuntimeConfig().public.nuxtQuery?.queryClientOptions || {}

      const queryClient = new QueryClient({
        ...clientOptions,
        queryCache: new QueryCache({
          onSuccess: (data: unknown) => console.log('onSuccess',
            Array.isArray(data)
              ? { firstChild: data[0], length: data.length }
              : { data }),
        }),
      })

      getPluginOptions(queryClient)
    })
  },
})

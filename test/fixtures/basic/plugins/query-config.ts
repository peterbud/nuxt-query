import { QueryClient, defaultShouldDehydrateQuery } from '@tanstack/vue-query'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin({
  enforce: 'pre',
  setup(nuxtApp) {
    nuxtApp.hook('nuxt-query:configure', (configure) => {
      const client = new QueryClient({
        defaultOptions: {
          dehydrate: {
            shouldDehydrateQuery: query => defaultShouldDehydrateQuery(query) && query.meta?.private !== true,
          },
        },
      })
      client.setQueryDefaults(['private'], { meta: { private: true } })
      client.setQueryData(['private'], 'private-query-secret')
      configure(client)
    })
  },
})

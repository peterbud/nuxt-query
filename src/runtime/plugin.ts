import type { DehydratedState, VueQueryPluginOptions } from '@tanstack/vue-query'
import { QueryClient, VueQueryPlugin, dehydrate, hydrate } from '@tanstack/vue-query'
import { defineNuxtPlugin, useRuntimeConfig, useState } from '#app'

export default defineNuxtPlugin({
  name: 'nuxt-query:plugin',

  async setup(nuxtApp) {
    const queryClientOptions = useRuntimeConfig().public.nuxtQuery?.queryClientOptions
    let queryClient: QueryClient | undefined
    let options: VueQueryPluginOptions | undefined

    const getPluginOptions = (queryClientParam?: QueryClient) => {
      queryClient = queryClientParam ?? new QueryClient(queryClientOptions)
      options = {
        queryClient,
      }
    }

    await nuxtApp.callHook('nuxt-query:configure', getPluginOptions)

    // If there is no hook has been set up
    if (!queryClient)
      queryClient = new QueryClient(queryClientOptions)

    if (!options)
      options = {
        queryClient,
        enableDevtoolsV6Plugin: true,
      }

    nuxtApp.vueApp.use(VueQueryPlugin, options)

    const vueQueryState = useState<DehydratedState | null>('vue-query-state')

    if (import.meta.server) {
      nuxtApp.hooks.hook('app:rendered', () => {
        vueQueryState.value = dehydrate(queryClient!)
      })
    }

    if (import.meta.client) hydrate(queryClient, vueQueryState.value)

    return {
      provide: {
        queryClient,
      },
    }
  },
})

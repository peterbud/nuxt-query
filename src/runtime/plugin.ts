import type { DehydratedState, VueQueryPluginOptions } from '@tanstack/vue-query'
import { QueryClient, VueQueryPlugin, dehydrate, hydrate } from '@tanstack/vue-query'
import { defineNuxtPlugin, useNuxtData, useRouter, useRuntimeConfig } from '#app'

const vueQueryStateKey = 'vue-query-state'

export default defineNuxtPlugin({
  name: 'nuxt-query:plugin',

  async setup(nuxtApp) {
    const { data: vueQueryState } = useNuxtData<DehydratedState>(vueQueryStateKey)
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

    if (import.meta.server) {
      nuxtApp.hooks.hook('app:rendered', () => {
        vueQueryState.value = dehydrate(queryClient!)
      })
    }

    if (import.meta.client) {
      const snapshot = vueQueryState.value
      if (snapshot)
        hydrate(queryClient, snapshot)

      useRouter().afterEach((_to, _from, failure) => {
        const snapshot = nuxtApp.static.data[vueQueryStateKey] as DehydratedState | undefined
        if (snapshot) {
          Reflect.deleteProperty(nuxtApp.static.data, vueQueryStateKey)
          if (!failure)
            hydrate(queryClient!, snapshot)
        }
      })
    }

    return {
      provide: {
        queryClient,
      },
    }
  },
})

import type { DehydratedState, VueQueryPluginOptions } from '@tanstack/vue-query'
import { QueryClient, VueQueryPlugin, dehydrate, hydrate } from '@tanstack/vue-query'
import { defineNuxtPlugin, useRuntimeConfig, useState } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const queryClientOptions = useRuntimeConfig().public.nuxtQuery?.queryClientOptions
  const queryClient = new QueryClient(queryClientOptions)
  const options: VueQueryPluginOptions = {
    queryClient,
    enableDevtoolsV6Plugin: true,
  }

  nuxtApp.vueApp.use(VueQueryPlugin, options)

  const vueQueryState = useState<DehydratedState | null>('vue-query-state')

  if (import.meta.server) {
    nuxtApp.hooks.hook('app:rendered', () => {
      vueQueryState.value = dehydrate(queryClient)
    })
  }

  if (import.meta.client) hydrate(queryClient, vueQueryState.value)

  return {
    provide: {
      queryClient,
    },
  }
})

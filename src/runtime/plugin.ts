import type { VueQueryPluginOptions } from '@tanstack/vue-query'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'

export default defineNuxtPlugin((_nuxtApp) => {
  const queryClientOptions = useRuntimeConfig().public.nuxtQuery?.queryClientOptions
  const queryClient = new QueryClient(queryClientOptions)
  const options: VueQueryPluginOptions = {
    queryClient,
    enableDevtoolsV6Plugin: true,
  }

  _nuxtApp.vueApp.use(VueQueryPlugin, options)

  return {
    provide: {
      queryClient,
    },
  }
})

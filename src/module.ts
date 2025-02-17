import { defineNuxtModule, addImports, addPlugin, createResolver } from '@nuxt/kit'
import { defu } from 'defu'
import type { QueryClientConfig } from '@tanstack/vue-query'
import { setupDevToolsUI } from './devtools'

const composables = [
  'useQuery',
  'useQueries',
  'useInfiniteQuery',
  'useMutation',
  'useIsFetching',
  'useIsMutating',
  'useQueryClient',
] as const
type VueQueryComposables = typeof composables[number]

// Module options TypeScript interface definition
export interface ModuleOptions {
  autoImports: VueQueryComposables[] | false
  devtools: boolean
  queryClientOptions: QueryClientConfig | undefined
}

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    nuxtQuery: ModuleOptions
  }
  interface RuntimeConfig {
    nuxtQuery: ModuleOptions
  }

  interface NuxtOptions {
    nuxtQuery: ModuleOptions
  }
}

const resolver = createResolver(import.meta.url)
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-query',
    configKey: 'nuxtQuery',
  },

  // Default configuration options of the Nuxt module
  defaults: {
    autoImports: [...composables],
    devtools: true,
  },

  setup(options, nuxt) {
    // Runtime Config
    nuxt.options.runtimeConfig.public.nuxtQuery = defu(
      nuxt.options.runtimeConfig.public.nuxtQuery,
      {
        ...options,
      },
    )
    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugin'))

    // Auto Imports tanstack composables
    if (nuxt.options.nuxtQuery?.autoImports && nuxt.options.nuxtQuery.autoImports.length > 0)
      addImports(nuxt.options.nuxtQuery.autoImports.map(name => ({ name, from: '@tanstack/vue-query' })))

    if (options.devtools)
      setupDevToolsUI(nuxt, resolver)
  },
})

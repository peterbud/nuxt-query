import { defineNuxtModule, addImports, addPlugin, createResolver } from '@nuxt/kit'
import { defu } from 'defu'
import type { QueryClientConfig } from '@tanstack/vue-query'
import { setupDevToolsUI } from './devtools'

const _composables = [
  'useQuery',
  'useQueries',
  'useInfiniteQuery',
  'useMutation',
  'useIsFetching',
  'useIsMutating',
  'useQueryClient',
] as const
type VueQueryComposables = typeof _composables[number]

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
    autoImports: false,
    devtools: true,
  },

  setup(options, nuxt) {
    console.log('module options', options)
    // Expose relevant runtime config to public
    nuxt.options.runtimeConfig.public.nuxtQuery = defu(
      nuxt.options.runtimeConfig.public.nuxtQuery,
      {
        queryClientOptions: { ...options.queryClientOptions },
      },
    )
    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugin'))

    // Auto Imports tanstack composables
    if (options.autoImports && options.autoImports.length > 0)
      addImports(options.autoImports.map(name => ({ name, from: '@tanstack/vue-query' })))

    if (options.devtools)
      setupDevToolsUI(nuxt, resolver)
  },
})

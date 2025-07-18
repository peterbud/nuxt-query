import { defineNuxtModule, addImports, addPlugin, createResolver } from '@nuxt/kit'
import { defu } from 'defu'
import type { QueryClient, QueryClientConfig } from '@tanstack/vue-query'
import type { HookResult } from '@nuxt/schema'
import { version } from '../package.json'
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

export interface ModuleOptions {
  autoImports: VueQueryComposables[] | boolean
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

export interface ModuleRuntimeHooks {
  'nuxt-query:configure': (
    getPluginOptions: (queryClient?: QueryClient) => void) => HookResult
}

declare module '#app' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface RuntimeNuxtHooks extends ModuleRuntimeHooks { }
}

const resolver = createResolver(import.meta.url)
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-query',
    configKey: 'nuxtQuery',
    version,
  },

  // Default configuration options of the Nuxt module
  defaults: {
    autoImports: false,
    devtools: true,
  },

  setup(options, nuxt) {
    // Expose relevant runtime config to public
    nuxt.options.runtimeConfig.public.nuxtQuery = defu(
      nuxt.options.runtimeConfig.public.nuxtQuery,
      {
        queryClientOptions: { ...options.queryClientOptions },
      },
    )

    addPlugin(resolver.resolve('./runtime/plugin'))

    // Auto imports tanstack composables
    let importComposables = new Set<VueQueryComposables>(_composables)
    if (typeof options.autoImports === 'boolean') {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      !options.autoImports && importComposables.clear()
    }
    else {
      importComposables = importComposables.intersection(new Set(options.autoImports))
    }
    addImports([...importComposables.values()].map(name => (
      { name, from: '@tanstack/vue-query' }
    )))

    if (options.devtools)
      setupDevToolsUI(nuxt, resolver)
  },
})

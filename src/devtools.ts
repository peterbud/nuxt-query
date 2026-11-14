import { existsSync } from 'node:fs'
import { addPlugin, useLogger, type Resolver } from '@nuxt/kit'
import type { Nuxt } from 'nuxt/schema'
import { NUXT_DEVTOOLS_GROUP_ID } from '@nuxt/devtools-kit'

const DEVTOOLS_UI_ROUTE = '/__nuxt-query-client'
const DEVTOOLS_UI_LOCAL_PORT = 3300

export function setupDevToolsUI(nuxt: Nuxt, resolver: Resolver) {
  if (!nuxt.options.dev)
    return

  // Nuxt loads its bundled DevTools after user modules.
  nuxt.hook('modules:done', () => {
    if (nuxt.options.devtools === false || nuxt.options.devtools?.enabled === false)
      return

    // Nuxt only installs DevTools for the Vite builder, so an upgrade hint would be unactionable.
    if (nuxt.options.builder !== '@nuxt/vite-builder')
      return

    const devtools = nuxt.options._installedModules.find(module => module.meta.name === '@nuxt/devtools')
    if (devtools?.meta.version?.startsWith('4.') && !devtools.meta.disabled) {
      setupPanel(nuxt, resolver)
      return
    }

    useLogger('nuxt-query').warn(
      'The Nuxt Query 2.x panel requires Nuxt DevTools 4 (Nuxt 4.5+ and Vite 8.1.5+). '
      + 'Follow https://nuxt.com/modules/devtools/upgrading-to-v4 to opt in; Nuxt 4 bundles DevTools 3. '
      + 'Query functionality is unaffected. Set nuxtQuery.devtools: false to disable the panel, '
      + 'or use @peterbud/nuxt-query@1 with DevTools 3.',
    )
  })
}

function setupPanel(nuxt: Nuxt, resolver: Resolver) {
  addPlugin({ src: resolver.resolve('./runtime/devtools.client'), mode: 'client' })

  const clientPath = resolver.resolve('./client')
  const isProductionBuild = existsSync(clientPath)

  // Serve production-built client (used when package is published)
  if (isProductionBuild) {
    nuxt.hook('vite:serverCreated', async (server) => {
      const sirv = await import('sirv').then(r => r.default || r) as typeof import('sirv').default
      server.middlewares.use(
        DEVTOOLS_UI_ROUTE,
        sirv(clientPath, { dev: true, single: true }),
      )
    })
  }
  // In local development, start a separate Nuxt Server and proxy to serve the client
  else {
    nuxt.options.vite.server = nuxt.options.vite.server || {}
    nuxt.options.vite.server.proxy = nuxt.options.vite.server.proxy || {}
    nuxt.options.vite.server.proxy[DEVTOOLS_UI_ROUTE] = {
      target: `http://localhost:${DEVTOOLS_UI_LOCAL_PORT}${DEVTOOLS_UI_ROUTE}`,
      changeOrigin: true,
      followRedirects: true,
      rewrite: path => path.replace(DEVTOOLS_UI_ROUTE, ''),
    }
  }

  nuxt.hook('devtools:ready', (ctx) => {
    ctx.docks.register({
      id: 'nuxt-query',
      title: 'Nuxt Query',
      icon: 'carbon:palm-tree',
      type: 'iframe',
      url: `${DEVTOOLS_UI_ROUTE}/vue-query`,
      groupId: NUXT_DEVTOOLS_GROUP_ID,
      category: 'modules',
    })
  })
}

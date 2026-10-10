import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch, createPage, url } from '@nuxt/test-utils/e2e'

describe('ssr', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
    browser: true,
  })

  it('renders the index page', async () => {
    // Get response to a server-rendered page with `$fetch`.
    const html = await $fetch('/')
    expect(html).toContain('<div>basic</div>')
  })

  it('captures awaited server queries in payload.data', async () => {
    const html = await $fetch('/plain')
    expect(html).toContain('server-query public')
    expect(html).toContain('vue-query-state')
    expect(html).toContain('dataUpdatedAt')
    expect(html).not.toContain('private-query-secret')
  })

  it.each(['swr', 'isr'])('extracts the %s query snapshot at runtime', async (route) => {
    const html = await $fetch<string>(`/${route}`)
    expect(html).toContain('vue-query-state')
    expect(html).not.toContain('data-src=')
    const payload = await $fetch<string>(`/${route}/_payload.json`, { responseType: 'text' })
    expect(payload).toContain('vue-query-state')
    expect(payload).toContain('server-query')
    expect(payload).toContain('dataUpdatedAt')
    expect(payload).not.toContain('private-query-secret')
  })

  it.each(['plain', 'swr', 'isr'])('hydrates a direct %s SSR visit without fetching a fresh query', async (route) => {
    const page = await createPage(`/${route}`)
    expect(await page.locator('#query').textContent()).toContain('server-query')
    expect(await page.locator('#query').getAttribute('data-calls')).toBe('0')
    expect(await page.evaluate(`window.queryTest.client.getQueryData(['page', '${route}']).createdAt instanceof Date`)).toBe(true)
    expect(await page.evaluate(`window.queryTest.client.getQueryState(['page', '${route}']).dataUpdatedAt === window.queryTest.nuxtApp.payload.data['vue-query-state'].queries[0].state.dataUpdatedAt`)).toBe(true)
    expect(await page.evaluate('Object.hasOwn(window.queryTest.nuxtApp.payload.data["vue-query-state"], "route")')).toBe(false)
    expect(await page.evaluate('Object.hasOwn(window.queryTest.nuxtApp.payload.state, "vue-query-state")')).toBe(false)
    await page.close()
  })

  it.each(['swr', 'isr'])('hydrates %s navigation before query consumers set up', async (route) => {
    const page = await createPage('/')
    const requests: string[] = []
    page.on('request', request => requests.push(request.url()))
    await page.locator(`a[href="/${route}"]`).click()
    await page.waitForSelector('#query')
    expect(await page.locator('#query').getAttribute('data-initial')).toBe('server-query')
    expect(await page.locator('#query').getAttribute('data-calls')).toBe('0')
    expect(requests.filter(request => request.includes(`/${route}/_payload.json`))).toHaveLength(1)
    await page.close()
  })

  it('keeps newer browser data when an older SWR snapshot arrives', async () => {
    const page = await createPage('/')
    await page.evaluate('window.queryTest.client.setQueryData([\'page\', \'swr\'], { source: \'browser-newer\', request: \'public\' }, { updatedAt: Date.now() + 60_000 })')
    await page.locator('a[href="/swr"]').click()
    await page.waitForSelector('#query')
    expect(await page.locator('#query').getAttribute('data-initial')).toBe('browser-newer')
    expect(await page.locator('#query').getAttribute('data-calls')).toBe('0')
    await page.close()
  })

  it('hydrates the final destination after a redirect', async () => {
    const page = await createPage('/')
    await page.evaluate('window.queryTest.router.beforeEach(to => to.path === "/redirect" ? "/swr" : undefined)')
    await page.evaluate('window.queryTest.router.push("/redirect")')
    await page.waitForSelector('#query')
    expect(new URL(page.url()).pathname).toBe('/swr')
    expect(await page.locator('#query').getAttribute('data-initial')).toBe('server-query')
    expect(await page.locator('#query').getAttribute('data-calls')).toBe('0')
    await page.close()
  })

  it('falls back to client fetching when the extracted snapshot has no query', async () => {
    const page = await createPage('/')
    await page.evaluate('window.queryTest.router.push(\'/empty\')')
    await page.waitForSelector('#query')
    expect(await page.locator('#query').getAttribute('data-initial')).toBe('missing')
    expect(await page.locator('#query').textContent()).toContain('client-query')
    expect(await page.locator('#query').getAttribute('data-calls')).toBe('1')
    await page.close()
  })

  it.each(['missing', 'failed'])('fetches normally after a %s payload load', async (result) => {
    const page = await createPage('/')
    await page.route('**/swr/_payload.json*', route => result === 'missing'
      ? route.fulfill({ contentType: 'application/json', body: '[{"data":1},{}]' })
      : route.abort())
    await page.locator('a[href="/swr"]').click()
    await page.waitForSelector('#query')
    expect(await page.locator('#query').getAttribute('data-initial')).toBe('missing')
    expect(await page.locator('#query').getAttribute('data-calls')).toBe('1')
    expect(await page.locator('#query').textContent()).toContain('client-query')
    await page.close()
  })

  it('does not hydrate a navigation cancelled after its payload loads', async () => {
    const page = await createPage('/')
    await page.evaluate('void (window.queryTest.stopAbort = window.queryTest.router.beforeResolve(to => to.path === \'/swr\' ? false : undefined))')
    await page.evaluate('window.queryTest.router.push(\'/swr\')')
    expect(await page.evaluate('window.queryTest.client.getQueryData([\'page\', \'swr\'])')).toBeUndefined()
    expect(await page.evaluate('window.queryTest.nuxtApp.static.data["vue-query-state"]')).toBeUndefined()
    await page.evaluate('window.queryTest.stopAbort()')
    await page.route('**/swr/_payload.json*', route => route.abort())
    await page.evaluate('window.queryTest.router.push(\'/swr\')')
    await page.waitForSelector('#query')
    expect(await page.locator('#query').textContent()).toContain('client-query')
    expect(await page.locator('#query').getAttribute('data-calls')).toBe('1')
    await page.close()
  })

  it('does not hydrate a superseded navigation whose payload arrives late', async () => {
    const page = await createPage('/')
    let release!: () => void
    const delayed = new Promise<void>((resolve) => {
      release = resolve
    })
    await page.route('**/swr/_payload.json*', async (route) => {
      await delayed
      await route.continue()
    })
    await Promise.all([
      page.waitForRequest(request => request.url().includes('/swr/_payload.json')),
      page.evaluate('void (window.queryTest.pending = window.queryTest.router.push(\'/swr\'))'),
    ])
    await page.evaluate('window.queryTest.router.push(\'/isr\')')
    release()
    await page.evaluate('window.queryTest.pending')
    expect(await page.locator('#query').getAttribute('data-initial')).toBe('server-query')
    expect(await page.evaluate('window.queryTest.client.getQueryData([\'page\', \'swr\'])')).toBeUndefined()
    await page.close()
  })

  it('uses Nuxt prefetching without adding another payload fetch', async () => {
    const page = await createPage('/')
    const requests: string[] = []
    page.on('request', request => requests.push(request.url()))
    await page.waitForLoadState('networkidle')
    const [prefetchResponse] = await Promise.all([
      page.waitForResponse(response => response.url().includes('/swr/_payload.json')),
      page.evaluate('window.queryTest.nuxtApp.callHook(\'link:prefetch\', \'/swr\')'),
    ])
    await prefetchResponse.finished()
    expect(requests.filter(request => request.includes('/swr/_payload.json'))).toHaveLength(1)
    requests.length = 0
    await page.locator('a[href="/swr"]').click()
    await page.waitForSelector('#query')
    expect(requests.filter(request => request.includes('/swr/_payload.json'))).toHaveLength(1)
    expect(await page.locator('#query').getAttribute('data-calls')).toBe('0')
    await page.close()
  })

  it('preserves legitimate refetching for stale hydrated queries', async () => {
    const page = await createPage('/stale')
    await page.waitForFunction('document.querySelector(\'#query\').dataset.calls === \'1\'')
    expect(await page.locator('#query').textContent()).toContain('client-query')
    await page.close()
  })

  it('hydrates a client-only direct visit through normal fetching', async () => {
    const page = await createPage('/client')
    expect(await page.locator('#query').textContent()).toContain('client-query')
    expect(await page.locator('#query').getAttribute('data-calls')).toBe('1')
    await page.close()
  })

  it('captures awaited queries at the end of streamed SSR', async () => {
    const html = await $fetch<string>('/stream')
    expect(html).toContain('server-query public')
    expect(html).toContain('vue-query-state')
    const page = await createPage()
    await page.goto(url('/stream'), { waitUntil: 'hydration' })
    expect(await page.locator('#query').getAttribute('data-calls')).toBe('0')
    await page.close()
  })

  it.each(['plain', 'client'])('fetches normally on unextracted %s navigation', async (route) => {
    const page = await createPage('/')
    await page.locator(`a[href="/${route}"]`).click()
    await page.waitForSelector('#query')
    expect(await page.locator('#query').textContent()).toContain('client-query')
    expect(await page.locator('#query').getAttribute('data-calls')).toBe('1')
    await page.close()
  })

  it('isolates the QueryClient across concurrent server renders', async () => {
    const [first, second] = await Promise.all([
      $fetch<string>('/isolation', { headers: { 'x-query-request': 'request-first' } }),
      $fetch<string>('/isolation', { headers: { 'x-query-request': 'request-second' } }),
    ])
    expect(first).toContain('request-first')
    expect(first).not.toContain('request-second')
    expect(second).toContain('request-second')
    expect(second).not.toContain('request-first')
  })
})

import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch, createPage, url } from '@nuxt/test-utils/e2e'

describe('external initial payload', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
    browser: true,
    nuxtConfig: {
      experimental: { payloadExtraction: true },
    },
  })

  it('hydrates after Nuxt loads and merges the external initial snapshot', async () => {
    const html = await $fetch<string>('/swr')
    expect(html).toContain('data-src=')
    expect(html).not.toContain('vue-query-state')
    const page = await createPage()
    const requests: string[] = []
    page.on('request', request => requests.push(request.url()))
    await page.goto(url('/swr'), { waitUntil: 'hydration' })
    expect(await page.locator('#query').textContent()).toContain('server-query')
    expect(await page.locator('#query').getAttribute('data-calls')).toBe('0')
    expect(requests.filter(request => request.includes('/swr/_payload.json'))).toHaveLength(1)
    await page.close()
  })

  it('hydrates extracted navigation before destination setup', async () => {
    const page = await createPage('/')
    await page.locator('a[href="/swr"]').click()
    await page.waitForSelector('#query')
    expect(await page.locator('#query').getAttribute('data-initial')).toBe('server-query')
    expect(await page.locator('#query').getAttribute('data-calls')).toBe('0')
    await page.close()
  })
})

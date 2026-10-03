import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch, createPage } from '@nuxt/test-utils/e2e'

describe('payload extraction disabled', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
    browser: true,
    nuxtConfig: {
      experimental: { payloadExtraction: false },
    },
  })

  it('hydrates direct SSR visits from the inline snapshot', async () => {
    const html = await $fetch<string>('/swr')
    expect(html).toContain('vue-query-state')
    expect(html).not.toContain('data-src=')
    const page = await createPage('/swr')
    expect(await page.locator('#query').textContent()).toContain('server-query')
    expect(await page.locator('#query').getAttribute('data-calls')).toBe('0')
    await page.close()
  })

  it('fetches normally during navigation without requesting a payload', async () => {
    const page = await createPage('/')
    const requests: string[] = []
    page.on('request', request => requests.push(request.url()))
    await page.locator('a[href="/swr"]').click()
    await page.waitForSelector('#query')
    expect(await page.locator('#query').textContent()).toContain('client-query')
    expect(await page.locator('#query').getAttribute('data-calls')).toBe('1')
    expect(requests.filter(request => request.includes('_payload.json'))).toHaveLength(0)
    await page.close()
  })

  it('preserves client-only rendering without a server snapshot', async () => {
    const page = await createPage('/client')
    expect(await page.locator('#query').textContent()).toContain('client-query')
    expect(await page.locator('#query').getAttribute('data-calls')).toBe('1')
    await page.close()
  })
})

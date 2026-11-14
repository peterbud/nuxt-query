import { QueryClient } from '@tanstack/vue-query'
import { effectScope } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useHostQueryClient } from '../client/app/utils/useHostQueryClient'
import { HOST_UPDATED_EVENT } from '../src/runtime/devtools-events'

type Host = { nuxt: { $queryClient?: QueryClient } }

describe('host query client waiting state', () => {
  const scopes: ReturnType<typeof effectScope>[] = []
  let parent: EventTarget & { __NUXT_DEVTOOLS_HOST__?: Host }
  let panel: EventTarget

  function connect() {
    const scope = effectScope()
    scopes.push(scope)
    return scope.run(useHostQueryClient)!
  }

  beforeEach(() => {
    vi.useFakeTimers()
    parent = new EventTarget()
    panel = Object.assign(new EventTarget(), { parent })
    vi.stubGlobal('window', panel)
  })

  afterEach(() => {
    scopes.splice(0).forEach(scope => scope.stop())
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('explains the failure after the timeout and still connects when the client arrives later', () => {
    const { queryClient, connectionMessage } = connect()
    expect(connectionMessage.value).toMatch(/^Waiting/)

    vi.advanceTimersByTime(5000)
    expect(connectionMessage.value).toMatch(/^Still no Nuxt application query client/)

    const client = new QueryClient()
    parent.__NUXT_DEVTOOLS_HOST__ = { nuxt: { $queryClient: client } }
    parent.dispatchEvent(new Event(HOST_UPDATED_EVENT))
    expect(queryClient.value).toBe(client)
    expect(connectionMessage.value).toBeUndefined()
  })

  it('does not time out once connected, after the page is hidden, or after disposal', () => {
    parent.__NUXT_DEVTOOLS_HOST__ = { nuxt: { $queryClient: new QueryClient() } }
    const connected = connect()
    vi.advanceTimersByTime(10_000)
    expect(connected.connectionMessage.value).toBeUndefined()

    parent.__NUXT_DEVTOOLS_HOST__ = undefined
    const hidden = connect()
    panel.dispatchEvent(new Event('pagehide'))
    vi.advanceTimersByTime(10_000)
    expect(hidden.connectionMessage.value).toMatch(/^Waiting/)

    expect(vi.getTimerCount()).toBe(0)
  })
})

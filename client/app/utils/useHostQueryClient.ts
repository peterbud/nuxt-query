import type { NuxtDevtoolsHostClient } from '@nuxt/devtools-kit/types'
import type { QueryClient } from '@tanstack/vue-query'
import { onScopeDispose, shallowRef } from 'vue'
import { HOST_DISCONNECTED_EVENT, HOST_UPDATED_EVENT } from '../../../src/runtime/devtools-events'

type QueryDevtoolsHost = NuxtDevtoolsHostClient & { nuxt: { $queryClient?: QueryClient } }

const WAITING_MESSAGE = 'Waiting for the Nuxt application query client...'
const WAITING_TIMEOUT_MS = 5000
const TIMED_OUT_MESSAGE = 'Still no Nuxt application query client. Check that the application runs in development '
  + 'with Nuxt DevTools 4, that the Nuxt Query plugin is active, and that this panel is opened inside '
  + 'the application\'s DevTools rather than a standalone DevTools window.'

export function useHostQueryClient() {
  const queryClient = shallowRef<QueryClient>()
  const connectionMessage = shallowRef<string | undefined>(WAITING_MESSAGE)
  let parent: Window | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  let timedOut = false

  function stopWaiting() {
    clearTimeout(timer)
    timer = undefined
    timedOut = false
  }

  // Repeated attempts keep the running timer, and a timed-out state stays until a client arrives.
  function wait() {
    queryClient.value = undefined
    connectionMessage.value = timedOut ? TIMED_OUT_MESSAGE : WAITING_MESSAGE
    if (!timedOut && timer === undefined) {
      timer = setTimeout(() => {
        timer = undefined
        timedOut = true
        connectionMessage.value = TIMED_OUT_MESSAGE
      }, WAITING_TIMEOUT_MS)
    }
  }

  function disconnect() {
    stopWaiting()
    wait()
  }

  function connect() {
    if (window.parent === window) {
      stopWaiting()
      queryClient.value = undefined
      connectionMessage.value = 'Open this panel from Nuxt DevTools to inspect the application cache.'
      return
    }

    try {
      const hostWindow = window.parent as Window & { __NUXT_DEVTOOLS_HOST__?: QueryDevtoolsHost }
      hostWindow.addEventListener(HOST_UPDATED_EVENT, connect)
      hostWindow.addEventListener(HOST_DISCONNECTED_EVENT, disconnect)
      parent = hostWindow
      const client = hostWindow.__NUXT_DEVTOOLS_HOST__?.nuxt.$queryClient
      if (client) {
        stopWaiting()
        queryClient.value = client
        connectionMessage.value = undefined
      }
      else {
        wait()
      }
    }
    catch (error) {
      if (!(error instanceof DOMException) || error.name !== 'SecurityError')
        throw error

      stopWaiting()
      queryClient.value = undefined
      connectionMessage.value = 'Cannot access the Nuxt application. Serve this panel from the same origin as the application.'
      return
    }
  }

  function suspend() {
    parent?.removeEventListener(HOST_UPDATED_EVENT, connect)
    parent?.removeEventListener(HOST_DISCONNECTED_EVENT, disconnect)
    parent = undefined
    // A hidden page must not run the timeout; it restarts when the page is shown again.
    stopWaiting()
    queryClient.value = undefined
    connectionMessage.value = WAITING_MESSAGE
  }

  if (typeof window !== 'undefined') {
    connect()
    window.addEventListener('pagehide', suspend)
    window.addEventListener('pageshow', connect)
    onScopeDispose(() => {
      window.removeEventListener('pagehide', suspend)
      window.removeEventListener('pageshow', connect)
      suspend()
    })
  }

  return { queryClient, connectionMessage }
}

import { useDevtoolsHostClient } from '@nuxt/devtools-kit/host-client'
import { watch } from 'vue'
import { defineNuxtPlugin } from '#app'
import { HOST_DISCONNECTED_EVENT, HOST_UPDATED_EVENT } from './devtools-events'

export default defineNuxtPlugin({
  name: 'nuxt-query:devtools',
  dependsOn: ['nuxt-query:plugin'],
  setup(nuxtApp) {
    const host = useDevtoolsHostClient()
    const stop = watch(host, (value) => {
      window.dispatchEvent(new Event(value ? HOST_UPDATED_EVENT : HOST_DISCONNECTED_EVENT))
    }, { immediate: true, flush: 'sync' })

    function dispose() {
      stop()
      window.dispatchEvent(new Event(HOST_DISCONNECTED_EVENT))
    }

    nuxtApp.vueApp.onUnmount(dispose)
    if (import.meta.hot)
      import.meta.hot.dispose(dispose)
  },
})

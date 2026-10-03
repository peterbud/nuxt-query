import { defineNuxtPlugin, useRouter } from '#app'

export default defineNuxtPlugin({
  dependsOn: ['nuxt-query:plugin'],
  setup(nuxtApp) {
    Object.assign(window, {
      queryTest: {
        client: nuxtApp.$queryClient,
        router: useRouter(),
        nuxtApp,
      },
    })
  },
})

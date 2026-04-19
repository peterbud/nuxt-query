import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  nitro: {
    externals: {
      inline: ['vue', 'vue-router', '@vue/server-renderer'],
    },
  },
})

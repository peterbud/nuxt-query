import VueJsonPretty from 'vue-json-pretty'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('VueJsonPretty', VueJsonPretty)
})

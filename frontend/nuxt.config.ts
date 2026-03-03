import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  css: ['~/assets/css/tailwind.css'],

  colorMode: {
    classSuffix: '',
  },

  components: [
    { path: '~/components/ui', pathPrefix: false, extensions: ['.vue'] },
    { path: '~/components/app', pathPrefix: false },
  ],

  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:3000/api/v1',
    },
  },

  app: {
    head: {
      title: 'Remnawave Market',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'VPN-подписки для Remnawave' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },
})

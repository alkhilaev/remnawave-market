import type { AuthResponse } from '~/types/auth';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  const baseURL = import.meta.server
    ? (config.apiBaseInternal as string) || (config.public.apiBase as string)
    : (config.public.apiBase as string);

  const api = $fetch.create({
    baseURL,

    onRequest({ options }) {
      if (authStore.accessToken) {
        options.headers =
          options.headers instanceof Headers
            ? options.headers
            : new Headers(options.headers as HeadersInit);
        options.headers.set('Authorization', `Bearer ${authStore.accessToken}`);
      }
    },

    async onResponseError({ response }) {
      // Token expired — try refresh
      if (response.status === 401 && authStore.refreshToken) {
        try {
          const data = await $fetch<AuthResponse>('/auth/refresh', {
            baseURL,
            method: 'POST',
            body: { refreshToken: authStore.refreshToken },
          });
          authStore.setAuth(data);
        } catch {
          authStore.logout();
        }
      }
    },
  });

  return { provide: { api } };
});

import type { AuthResponse } from '~/types/auth';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  const baseURL = import.meta.server
    ? (config.apiBaseInternal as string) || (config.public.apiBase as string)
    : (config.public.apiBase as string);

  let refreshPromise: Promise<void> | null = null;

  async function api<T>(url: string, opts: Parameters<typeof $fetch>[1] = {}): Promise<T> {
    const headers = new Headers((opts.headers as HeadersInit) ?? {});
    if (authStore.accessToken) {
      headers.set('Authorization', `Bearer ${authStore.accessToken}`);
    }

    try {
      return await $fetch<T>(url, { ...opts, baseURL, headers });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;

      if (status !== 401 || !authStore.refreshToken) {
        throw err;
      }

      // Deduplicate concurrent refresh calls
      if (!refreshPromise) {
        refreshPromise = $fetch<AuthResponse>('/auth/refresh', {
          baseURL,
          method: 'POST',
          body: { refreshToken: authStore.refreshToken },
        })
          .then((data) => {
            authStore.setAuth(data);
          })
          .catch(() => {
            authStore.logout();
            throw err;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      await refreshPromise;

      // Retry with new token
      const retryHeaders = new Headers((opts.headers as HeadersInit) ?? {});
      retryHeaders.set('Authorization', `Bearer ${authStore.accessToken}`);
      return await $fetch<T>(url, { ...opts, baseURL, headers: retryHeaders });
    }
  }

  return { provide: { api } };
});

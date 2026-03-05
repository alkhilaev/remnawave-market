export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  const baseURL = import.meta.server
    ? (config.apiBaseInternal as string) || (config.public.apiBase as string)
    : (config.public.apiBase as string);

  let refreshPromise: Promise<void> | null = null;

  async function api<T>(url: string, opts: Parameters<typeof $fetch>[1] = {}): Promise<T> {
    try {
      return await $fetch<T>(url, { ...opts, baseURL, credentials: 'include' });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;

      if (status !== 401 || url === '/auth/refresh') {
        throw err;
      }

      // Deduplicate concurrent refresh calls
      if (!refreshPromise) {
        refreshPromise = $fetch<{
          user: { id: string; email: string; role: string; balance: number };
        }>('/auth/refresh', {
          baseURL,
          method: 'POST',
          credentials: 'include',
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

      // Retry with new cookie (set by refresh response)
      return await $fetch<T>(url, { ...opts, baseURL, credentials: 'include' });
    }
  }

  return { provide: { api } };
});

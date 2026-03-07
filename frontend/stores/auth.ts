import type { AuthResponse, User } from '~/types/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);

  const isAuthenticated = computed(() => !!user.value);

  function setAuth(data: AuthResponse) {
    user.value = data.user;
  }

  async function fetchUser() {
    const { $api } = useNuxtApp();
    const data = await $api<{ user: User }>('/auth/me');
    user.value = data.user;
  }

  async function logout() {
    try {
      const { $api } = useNuxtApp();
      await $api('/auth/logout', { method: 'POST' });
    } catch {
      // ignore logout errors
    }
    user.value = null;
    navigateTo('/auth/login');
  }

  return {
    user,
    isAuthenticated,
    setAuth,
    fetchUser,
    logout,
  };
});

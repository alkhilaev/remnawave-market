import type { AuthResponse, User } from '~/types/auth';

export const useAuthStore = defineStore(
  'auth',
  () => {
    const user = ref<User | null>(null);
    const accessToken = ref<string | null>(null);
    const refreshToken = ref<string | null>(null);

    const isAuthenticated = computed(() => !!accessToken.value);

    function setAuth(data: AuthResponse) {
      user.value = data.user;
      accessToken.value = data.accessToken;
      refreshToken.value = data.refreshToken;
    }

    async function fetchUser() {
      const { $api } = useNuxtApp();
      const data = await $api<{ user: User }>('/auth/me');
      user.value = data.user;
    }

    function logout() {
      user.value = null;
      accessToken.value = null;
      refreshToken.value = null;
      navigateTo('/auth/login');
    }

    return {
      user,
      accessToken,
      refreshToken,
      isAuthenticated,
      setAuth,
      fetchUser,
      logout,
    };
  },
  {
    persist: true,
  },
);

import type { AuthResponse, LoginRequest, RegisterRequest, User } from '~/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)

  function setAuth(data: AuthResponse) {
    user.value = data.user
    accessToken.value = data.accessToken
    refreshToken.value = data.refreshToken
  }

  function logout() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    navigateTo('/auth/login')
  }

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    setAuth,
    logout,
  }
}, {
  persist: true,
})

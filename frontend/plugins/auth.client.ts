export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();

  try {
    await authStore.fetchUser();
  } catch {
    authStore.user = null;
  }
});

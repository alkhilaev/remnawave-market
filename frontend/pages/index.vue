<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

useHead({
  title: 'Remnawave Market',
})

const authStore = useAuthStore()
</script>

<template>
  <div class="flex min-h-dvh flex-col items-center justify-center px-4">
    <h1 class="text-2xl font-bold text-foreground">
      Remnawave Market
    </h1>
    <p class="mt-2 text-muted-foreground">
      Добро пожаловать, {{ authStore.user?.email }}
    </p>
    <button
      class="mt-4 rounded-md bg-destructive px-4 py-2 text-sm text-white transition-colors hover:bg-destructive/90"
      @click="authStore.logout()"
    >
      Выйти
    </button>
  </div>
</template>

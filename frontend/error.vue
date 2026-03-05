<script setup lang="ts">
import type { NuxtError } from '#app';

defineProps<{
  error: NuxtError;
}>();

const handleError = () => clearError({ redirect: '/' });
</script>

<template>
  <div class="flex min-h-dvh flex-col items-center justify-center bg-background px-4">
    <h1 class="text-6xl font-bold text-foreground">
      {{ error.statusCode }}
    </h1>
    <p class="mt-4 text-lg text-muted-foreground">
      {{ error.statusCode === 404 ? 'Страница не найдена' : 'Произошла ошибка' }}
    </p>
    <button
      class="mt-6 rounded-md bg-primary px-6 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
      @click="handleError"
    >
      На главную
    </button>
  </div>
</template>

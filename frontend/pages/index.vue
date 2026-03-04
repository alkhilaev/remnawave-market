<script setup lang="ts">
import type { Subscription } from '~/types/subscription'

definePageMeta({
  middleware: 'auth',
})

useHead({
  title: 'Мои подписки — Remnawave Market',
})

const authStore = useAuthStore()

// TODO: заменить на реальный API вызов
const subscriptions = ref<Subscription[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    // Мок-данные пока нет API
    subscriptions.value = []
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <main class="mx-auto max-w-lg px-4 py-5">
      <AppHeader />

      <div class="mt-4">
        <!-- Subscriptions list -->
        <div v-if="loading" class="flex flex-col gap-3">
          <div v-for="i in 2" :key="i" class="h-[72px] animate-pulse rounded-xl bg-muted" />
        </div>

        <div v-else-if="subscriptions.length > 0" class="flex flex-col gap-3">
          <SubscriptionCard
            v-for="sub in subscriptions"
            :key="sub.id"
            :subscription="sub"
          />
        </div>

        <TrialPromoCard v-else />
      </div>
    </main>
  </div>
</template>

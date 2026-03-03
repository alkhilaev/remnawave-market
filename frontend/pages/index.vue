<script setup lang="ts">
import { Button } from '@/components/ui/button'
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

const botUrl = 'https://t.me/remnawave_bot'
</script>

<template>
  <div>
    <AppHeader />

    <main class="mx-auto max-w-lg px-4 py-6">
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

      <div v-else class="rounded-xl border border-dashed p-6 text-center">
        <p class="text-sm text-muted-foreground">
          У вас пока нет подписок
        </p>
      </div>

      <!-- Buy button -->
      <a :href="botUrl" target="_blank" rel="noopener noreferrer" class="mt-4 block">
        <Button variant="outline" class="w-full text-primary">
          Купить подписку в телеграм-боте
        </Button>
      </a>

      <!-- Telegram promo -->
      <div class="mt-6">
        <TelegramPromoCard />
      </div>
    </main>
  </div>
</template>

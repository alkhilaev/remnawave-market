<script setup lang="ts">
import { toast } from 'vue-sonner'
import { User, Globe, ChevronRight, Gift, LogOut } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

definePageMeta({
  middleware: 'auth',
})

useHead({
  title: 'Профиль — Remnawave Market',
})

const authStore = useAuthStore()

function handleLinkTelegram() {
  toast.info('Привязка Telegram будет доступна позже')
}

function handlePromoCode() {
  toast.info('Промо-коды будут доступны позже')
}

function handleLogout() {
  authStore.logout()
}
</script>

<template>
  <div>
    <main class="mx-auto max-w-lg px-4 py-5">
      <AppHeader show-back />

      <!-- Balance card -->
      <div class="mt-4 rounded-2xl bg-gradient-to-br from-primary to-blue-600 p-5 text-white">
        <p class="text-2xl font-bold">
          {{ authStore.user?.balance ?? 0 }} <span class="text-base font-normal">бонусов</span>
        </p>
        <Button
          variant="secondary"
          size="sm"
          class="mt-3 bg-white/20 text-white hover:bg-white/30"
        >
          Как заработать бонусы?
        </Button>
      </div>

      <!-- Account section -->
      <div class="mt-6 flex flex-col gap-2">
        <Card class="cursor-pointer transition-colors hover:bg-accent/50">
          <div class="flex items-center gap-3 p-4">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <User class="h-5 w-5 text-muted-foreground" />
            </div>
            <span class="flex-1 text-sm font-medium">Данные аккаунта</span>
            <span class="text-xs text-muted-foreground mr-1 truncate max-w-[140px]">
              {{ authStore.user?.email }}
            </span>
            <ChevronRight class="h-5 w-5 shrink-0 text-muted-foreground" />
          </div>
        </Card>

        <Card class="cursor-pointer transition-colors hover:bg-accent/50">
          <div class="flex items-center gap-3 p-4">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <Globe class="h-5 w-5 text-muted-foreground" />
            </div>
            <span class="flex-1 text-sm font-medium">Язык</span>
            <span class="text-xs text-muted-foreground mr-1">Русский</span>
            <ChevronRight class="h-5 w-5 shrink-0 text-muted-foreground" />
          </div>
        </Card>
      </div>

      <!-- Link Telegram -->
      <Card class="mt-6">
        <div class="p-5">
          <h3 class="text-base font-semibold">
            Привяжите телеграм-аккаунт
          </h3>
          <p class="mt-1 text-sm text-muted-foreground">
            Если у вас есть подписки в телеграм, они появятся в личном кабинете.
          </p>
          <Button
            variant="outline"
            class="mt-4 w-full text-primary"
            @click="handleLinkTelegram"
          >
            Привязать телеграм
          </Button>
        </div>
      </Card>

      <!-- Promo code -->
      <Card class="mt-4 cursor-pointer transition-colors hover:bg-accent/50" @click="handlePromoCode">
        <div class="flex items-center gap-3 p-4">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <Gift class="h-5 w-5 text-muted-foreground" />
          </div>
          <span class="flex-1 text-sm font-medium">Ввести подарочный код</span>
          <ChevronRight class="h-5 w-5 shrink-0 text-muted-foreground" />
        </div>
      </Card>

      <!-- Logout -->
      <Button
        variant="outline"
        class="mt-6 w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        @click="handleLogout"
      >
        <LogOut class="mr-2 h-4 w-4" />
        Выйти
      </Button>
    </main>
  </div>
</template>

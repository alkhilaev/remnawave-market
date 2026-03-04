<script setup lang="ts">
import { Shield, User, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

interface Props {
  showBack?: boolean
}

withDefaults(defineProps<Props>(), {
  showBack: false,
})

const config = useRuntimeConfig()
const appName = config.public.appName as string
const appLogo = config.public.appLogo as string
</script>

<template>
  <header class="rounded-2xl border bg-card/80 backdrop-blur-sm">
    <div class="flex h-14 items-center justify-between px-4">
      <NuxtLink to="/" class="flex items-center gap-2">
        <img
          v-if="appLogo"
          :src="appLogo"
          :alt="appName"
          class="h-7 w-7 object-contain"
        >
        <Shield v-else class="size-6 text-primary" />
        <span class="text-base font-bold tracking-tight">{{ appName }}</span>
      </NuxtLink>

      <div class="flex items-center gap-1">
        <ThemeToggle />

        <NuxtLink v-if="!showBack" to="/profile">
          <Button variant="ghost" size="icon" class="size-9">
            <User class="size-6" />
          </Button>
        </NuxtLink>

        <NuxtLink v-else to="/">
          <Button variant="ghost" size="icon" class="size-9">
            <X class="size-6" />
          </Button>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

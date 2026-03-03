<script setup lang="ts">
import { Shield, User, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

interface Props {
  showBack?: boolean
}

withDefaults(defineProps<Props>(), {
  showBack: false,
})
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
    <div class="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
      <NuxtLink to="/" class="flex items-center gap-2">
        <Shield class="h-6 w-6 text-primary" />
        <span class="text-base font-bold tracking-tight">REMNAWAVE</span>
      </NuxtLink>

      <NuxtLink v-if="!showBack" to="/profile">
        <Button variant="ghost" size="icon" class="h-9 w-9">
          <User class="h-5 w-5" />
        </Button>
      </NuxtLink>

      <NuxtLink v-else to="/">
        <Button variant="ghost" size="icon" class="h-9 w-9">
          <X class="h-5 w-5" />
        </Button>
      </NuxtLink>
    </div>
  </header>
</template>

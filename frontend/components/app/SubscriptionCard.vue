<script setup lang="ts">
import { KeyRound, ChevronRight } from 'lucide-vue-next'
import { Card } from '@/components/ui/card'
import type { Subscription } from '~/types/subscription'
import { statusLabels, statusColors } from '~/types/subscription'

defineProps<{
  subscription: Subscription
}>()
</script>

<template>
  <Card class="cursor-pointer transition-colors hover:bg-accent/50">
    <div class="flex items-center gap-3 p-4">
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
        <KeyRound class="h-5 w-5 text-muted-foreground" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium leading-tight">
          {{ subscription.planName }}
        </p>
        <div class="flex items-center gap-1.5 mt-0.5">
          <span class="inline-block h-2 w-2 rounded-full" :class="{
            'bg-green-500': subscription.status === 'ACTIVE',
            'bg-red-500': subscription.status === 'EXPIRED',
            'bg-yellow-500': subscription.status === 'SUSPENDED',
            'bg-muted-foreground': subscription.status === 'CANCELED',
          }" />
          <span class="text-xs" :class="statusColors[subscription.status]">
            {{ statusLabels[subscription.status] }}
          </span>
        </div>
      </div>
      <ChevronRight class="h-5 w-5 shrink-0 text-muted-foreground" />
    </div>
  </Card>
</template>

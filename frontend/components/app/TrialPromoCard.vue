<script setup lang="ts">
import { Rocket, Check } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'

const features = [
  'Неблокируемый VPN',
  'Высокая скорость',
  'Без ограничений трафика',
  'Поддержка всех устройств',
]

function handleStartTrial() {
  toast.info('Пробная подписка будет доступна позже')
}
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-blue-600 p-6 text-white">
    <!-- Background decoration -->
    <div class="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
    <div class="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/5" />

    <div class="relative">
      <div class="flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
          <Rocket class="h-6 w-6" />
        </div>
        <div>
          <p class="text-sm font-medium text-white/80">Попробуйте бесплатно</p>
          <h3 class="text-xl font-bold">3 дня бесплатно</h3>
        </div>
      </div>

      <div class="mt-5 flex flex-col gap-2.5">
        <div v-for="feature in features" :key="feature" class="flex items-center gap-2.5">
          <div class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
            <Check class="h-3 w-3" />
          </div>
          <span class="text-sm">{{ feature }}</span>
        </div>
      </div>

      <Button
        class="mt-5 w-full bg-white text-primary font-semibold hover:bg-white/90"
        @click="handleStartTrial"
      >
        Начать пробную подписку
      </Button>
    </div>
  </div>
</template>

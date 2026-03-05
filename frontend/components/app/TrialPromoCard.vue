<script setup lang="ts">
import { Zap, Wifi, MessageCircle, Globe, Headset } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { toast } from 'vue-sonner';

const platforms = ['iOS', 'Android', 'Windows', 'macOS', 'Linux', 'Android TV', 'Apple TV'];

const features = [
  { icon: Zap, text: 'Высокая скорость соединения' },
  { icon: MessageCircle, text: 'YouTube в 8K, Telegram и WhatsApp без сбоев' },
  { icon: Globe, text: 'Российские сайты без отключения VPN' },
  { icon: Wifi, text: 'Безлимитный трафик и одна подписка на все устройства' },
  { icon: Headset, text: 'Техническая поддержка 24/7' },
];

function handleStartTrial() {
  toast.info('Пробная подписка будет доступна позже');
}
</script>

<template>
  <div
    class="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary via-blue-600 to-indigo-700 p-6 text-white"
  >
    <!-- Background decoration -->
    <div class="absolute -top-10 -right-10 size-40 rounded-full bg-white/10 blur-2xl" />
    <div class="absolute -bottom-12 -left-12 size-48 rounded-full bg-white/5 blur-2xl" />
    <div class="absolute top-4 right-4 size-20 rounded-full bg-white/5" />

    <div class="relative">
      <!-- Header -->
      <div>
        <h3 class="font-unbounded text-2xl font-extrabold tracking-tight uppercase">
          3 дня бесплатно
        </h3>
        <p class="mt-1 text-sm text-white/70">Подключайтесь прямо сейчас!</p>
      </div>

      <!-- Platforms -->
      <div class="mt-3 flex flex-wrap gap-1.5">
        <span
          v-for="p in platforms"
          :key="p"
          class="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium"
        >
          {{ p }}
        </span>
      </div>

      <!-- Divider -->
      <div class="my-4 h-px bg-white/15" />

      <!-- Features -->
      <div class="flex flex-col gap-3">
        <div v-for="feature in features" :key="feature.text" class="flex items-center gap-3">
          <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
            <component :is="feature.icon" class="size-4" />
          </div>
          <span class="text-sm font-medium">{{ feature.text }}</span>
        </div>
      </div>

      <!-- CTA -->
      <Button
        class="mt-6 h-12 w-full rounded-xl bg-white text-base font-semibold text-primary hover:bg-white/90"
        @click="handleStartTrial"
      >
        Начать пробную подписку
      </Button>
    </div>
  </div>
</template>

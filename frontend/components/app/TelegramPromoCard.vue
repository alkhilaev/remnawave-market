<script setup lang="ts">
import { Monitor, Settings, Wifi, Headphones } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';

const botUrl = 'https://t.me/remnawave_bot';
</script>

<template>
  <div class="rounded-2xl bg-linear-to-br from-blue-400 to-blue-500 p-5 text-white">
    <h3 class="text-base/tight font-semibold">Управляйте подпиской в нашем телеграм-боте</h3>
    <p class="mt-2 text-sm/snug text-white/80">
      Скоро всё будет доступно прямо здесь. А пока — воспользуйтесь нашим телеграм-ботом.
    </p>

    <div class="mt-4 flex flex-col gap-2.5">
      <div class="flex items-center gap-3">
        <Monitor class="size-5 shrink-0 text-white/90" />
        <span class="text-sm">Продлевайте подписку</span>
      </div>
      <div class="flex items-center gap-3">
        <Settings class="size-5 shrink-0 text-white/90" />
        <span class="text-sm">Настраивайте параметры VPN</span>
      </div>
      <div class="flex items-center gap-3">
        <Wifi class="size-5 shrink-0 text-white/90" />
        <span class="text-sm">Докупайте пакеты трафика</span>
      </div>
      <div class="flex items-center gap-3">
        <Headphones class="size-5 shrink-0 text-white/90" />
        <span class="text-sm">Поддержка с 10 до 22 МСК</span>
      </div>
    </div>

    <a :href="botUrl" target="_blank" rel="noopener noreferrer" class="mt-4 block">
      <Button variant="secondary" class="w-full bg-white text-blue-500 hover:bg-white/90">
        Перейти в телеграм-бот
      </Button>
    </a>
  </div>
</template>

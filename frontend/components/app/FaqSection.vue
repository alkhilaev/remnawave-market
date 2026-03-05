<script setup lang="ts">
import { HelpCircle } from 'lucide-vue-next'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const config = useRuntimeConfig()
const appName = config.public.appName as string

const faq = computed(() => [
  {
    q: 'Что будет после пробного периода?',
    a: `После окончания 3-дневного пробного периода вы сможете выбрать подходящий тариф и продолжить пользоваться ${appName}. Никаких автоматических списаний.`,
  },
  {
    q: 'Как подключить VPN?',
    a: `После активации вы получите ключ подключения ${appName}. Скопируйте его в любое совместимое приложение — подробная инструкция будет в личном кабинете.`,
  },
  {
    q: `${appName} сильно снижает скорость интернета?`,
    a: 'Практически нет. Мы используем современные протоколы, оптимизированные для минимального влияния на скорость. Падение составляет не более 5–10% — это незаметно при обычном использовании. Наши серверы поддерживают пропускную способность до 1 Гбит/с.',
  },
  {
    q: 'Это законно?',
    a: 'Да, в большинстве стран, включая Россию, Казахстан и Украину, использование VPN полностью законно. VPN — это инструмент защиты конфиденциальности и безопасности в интернете. Перед поездкой за границу рекомендуем ознакомиться с местным законодательством.',
  },
  {
    q: 'Почему не стоит использовать бесплатные VPN?',
    a: `Бесплатные VPN зарабатывают на продаже ваших данных третьим лицам, используют слабое шифрование и показывают навязчивую рекламу. Некоторые даже задействуют ресурсы вашего устройства в своих целях. ${appName} гарантирует надёжную защиту и стабильную работу.`,
  },
  {
    q: 'На скольких устройствах можно использовать?',
    a: 'Количество устройств зависит от выбранного тарифа. Пробный период включает подключение на одном устройстве.',
  },
])
</script>

<template>
  <div class="rounded-2xl border bg-card p-5">
    <div class="flex items-center gap-2.5">
      <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
        <HelpCircle class="h-5 w-5 text-primary" />
      </div>
      <h3 class="font-unbounded text-base font-bold">Частые вопросы</h3>
    </div>

    <Accordion type="single" collapsible class="mt-4">
      <AccordionItem
        v-for="(item, i) in faq"
        :key="i"
        :value="`item-${i}`"
        class="border-b-0 rounded-xl mb-2 last:mb-0 bg-muted/50 px-4"
      >
        <AccordionTrigger class="text-sm text-left hover:no-underline py-3.5">
          {{ item.q }}
        </AccordionTrigger>
        <AccordionContent class="text-sm text-muted-foreground">
          {{ item.a }}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
</template>

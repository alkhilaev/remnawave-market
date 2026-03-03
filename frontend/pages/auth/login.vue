<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { AuthResponse, ApiError } from '~/types/auth'

definePageMeta({
  layout: 'auth',
})

useHead({
  title: 'Вход — Remnawave Market',
})

const { $api } = useNuxtApp()
const authStore = useAuthStore()
const loading = ref(false)

const schema = toTypedSchema(z.object({
  email: z.string({ message: 'Введите email' }).email('Некорректный email'),
  password: z.string({ message: 'Введите пароль' }).min(1, 'Введите пароль'),
}))

const { handleSubmit, defineField, errors } = useForm({
  validationSchema: schema,
})

const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  try {
    const data = await ($api as typeof $fetch)<AuthResponse>('/auth/login', {
      method: 'POST',
      body: values,
    })
    authStore.setAuth(data)
    navigateTo('/')
  }
  catch (err: unknown) {
    const error = err as { data?: ApiError }
    toast.error(error.data?.message || 'Ошибка при входе')
  }
  finally {
    loading.value = false
  }
})

const telegramLoading = ref(false)

async function handleTelegramAuth() {
  telegramLoading.value = true
  toast.info('Telegram-авторизация доступна через бота')
  telegramLoading.value = false
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold tracking-tight text-foreground">
        Remnawave Market
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">
        VPN-подписки
      </p>
    </div>

    <Card>
      <CardHeader class="pb-4">
        <CardTitle class="text-lg">
          Вход
        </CardTitle>
        <CardDescription>
          Войдите в аккаунт для управления подписками
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form class="flex flex-col gap-4" @submit="onSubmit">
          <div class="flex flex-col gap-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="email"
              v-bind="emailAttrs"
              type="email"
              placeholder="mail@example.com"
              autocomplete="email"
              :class="{ 'border-destructive': errors.email }"
            />
            <p v-if="errors.email" class="text-xs text-destructive">
              {{ errors.email }}
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <Label for="password">Пароль</Label>
            <Input
              id="password"
              v-model="password"
              v-bind="passwordAttrs"
              type="password"
              placeholder="Введите пароль"
              autocomplete="current-password"
              :class="{ 'border-destructive': errors.password }"
            />
            <p v-if="errors.password" class="text-xs text-destructive">
              {{ errors.password }}
            </p>
          </div>

          <Button type="submit" class="w-full" :disabled="loading">
            <template v-if="loading">
              <svg class="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Вход...
            </template>
            <template v-else>
              Войти
            </template>
          </Button>
        </form>

        <div class="relative my-4">
          <Separator />
          <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            или
          </span>
        </div>

        <Button
          variant="outline"
          class="w-full"
          :disabled="telegramLoading"
          @click="handleTelegramAuth"
        >
          <svg class="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
          Войти через Telegram
        </Button>
      </CardContent>

      <CardFooter class="justify-center">
        <p class="text-sm text-muted-foreground">
          Нет аккаунта?
          <NuxtLink to="/auth/register" class="font-medium text-primary underline-offset-4 hover:underline">
            Зарегистрироваться
          </NuxtLink>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>

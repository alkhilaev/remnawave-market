<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const colorMode = useColorMode()

function toggle() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <Button variant="ghost" size="icon" class="size-9" @click="toggle">
    <Sun class="size-6 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
    <Moon class="absolute size-6 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
    <span class="sr-only">Переключить тему</span>
  </Button>
</template>

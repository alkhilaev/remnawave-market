import { createConfigForNuxt } from '@nuxt/eslint-config';
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default createConfigForNuxt({}).append(
  {
    plugins: {
      prettier: prettierPlugin,
      'better-tailwindcss': eslintPluginBetterTailwindcss,
    },
    rules: {
      ...prettierConfig.rules,
      ...eslintPluginBetterTailwindcss.configs.recommended.rules,
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
      'better-tailwindcss/no-unknown-classes': ['error', { ignore: ['^toaster$'] }],
      'prettier/prettier': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'assets/css/tailwind.css',
      },
    },
  },
  {
    ignores: ['.nuxt/**', '.output/**', 'dist/**', 'node_modules/**'],
  },
);

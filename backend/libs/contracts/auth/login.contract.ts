import { z } from 'zod';

/**
 * Контракт для авторизации (логин)
 */
export const LoginContract = {
  Request: z.object({
    email: z.string().email('Некорректный email'),
    password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  }),

  Response: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: z.object({
      id: z.string().uuid(),
      email: z.string().email(),
      role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']),
    }),
  }),
};

export type LoginRequest = z.infer<typeof LoginContract.Request>;
export type LoginResponse = z.infer<typeof LoginContract.Response>;

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).optional(),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000')
    .transform((value) => value.split(',').map((origin) => origin.trim())),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
  process.exit(1);
}

export const config = {
  ...result.data,
  isProduction: result.data.NODE_ENV === 'production',
};

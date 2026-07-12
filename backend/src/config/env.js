const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  ENABLE_DEV_ACTOR_HEADER: z.coerce.boolean().default(false),
  AUTH_ACCESS_TOKEN_TTL: z.string().default('15m'),
  AUTH_SESSION_IDLE_DAYS: z.coerce.number().int().positive().default(14),
  AUTH_SESSION_ABSOLUTE_DAYS: z.coerce.number().int().positive().default(30),
  AUTH_COOKIE_NAME: z.string().min(1).default('laundry_device_session'),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://127.0.0.1:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');

  throw new Error(`Invalid environment configuration: ${details}`);
}

module.exports = {
  env: parsed.data,
};

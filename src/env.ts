import { default as Joi } from 'joi'
import { Env } from '@nestmtx/config'
import type { EnvSchema } from '@nestmtx/config'

const envSchema: EnvSchema = {
  LOG_LEVEL: Joi.string()
    .allow('emerg', 'alert', 'crit', 'error', 'warning', 'notice', 'info', 'debug')
    .default('info'),
}

export const env = new Env(envSchema)

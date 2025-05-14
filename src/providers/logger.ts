import { env } from '../env'
import { Logger, PinoCompatibleLogger } from '@nhtio/logger'
import type { LoggerLevel } from '@nhtio/logger'

export const logger = new Logger(env.get('LOG_LEVEL'))
export const pino = new PinoCompatibleLogger(env.get('LOG_LEVEL'))

export const logCompletePromise = new Promise<void>((resolve) => {
  logger.complete.then(() => resolve(void 0))
})

/**
 * Pretty prints an error with colorful output using
 * Youch terminal
 */
export async function prettyPrintError(error: any) {
  // @ts-expect-error
  const { default: youchTerminal } = await import('youch-terminal')
  const { default: Youch } = await import('youch')
  const youch = new Youch(error, {})
  logger.error(youchTerminal(await youch.toJSON(), { displayShortPath: true }))
}

export const inspect = (i: unknown, l?: LoggerLevel | Uppercase<LoggerLevel>) =>
  logger.inspect(i, l)

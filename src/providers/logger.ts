import winston from "winston";
import { env } from "../env";
import { inspect as nodeInspect } from "node:util";
export const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  level: env.get("LOG_LEVEL"),
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  ],
  exitOnError: false,
  handleExceptions: true,
  handleRejections: true,
});

export const logCompletePromise = new Promise<void>((resolve) => {
  logger.on("finish", resolve);
});

export const pino = {
  trace(what: any, ...args: any[]) {
    const toOutput = [what, ...args]
      .map((a) => nodeInspect(a, { depth: 5 }))
      .join(" ");
    logger.debug(toOutput);
  },
  debug(what: any, ...args: any[]) {
    const toOutput = [what, ...args]
      .map((a) => nodeInspect(a, { depth: 5 }))
      .join(" ");
    logger.debug(toOutput);
  },
  info(what: any, ...args: any[]) {
    const toOutput = [what, ...args]
      .map((a) => nodeInspect(a, { depth: 5 }))
      .join(" ");
    logger.info(toOutput);
  },
  warn(what: any, ...args: any[]) {
    const toOutput = [what, ...args]
      .map((a) => nodeInspect(a, { depth: 5 }))
      .join(" ");
    logger.warning(toOutput);
  },
  error(what: any, ...args: any[]) {
    const toOutput = [what, ...args]
      .map((a) => nodeInspect(a, { depth: 5 }))
      .join(" ");
    logger.error(toOutput);
  },
  fatal(what: any, ...args: any[]) {
    const toOutput = [what, ...args]
      .map((a) => nodeInspect(a, { depth: 5 }))
      .join(" ");
    logger.crit(toOutput);
  },
  child() {
    return pino;
  },
};

/**
 * Pretty prints an error with colorful output using
 * Youch terminal
 */
export async function prettyPrintError(error: any) {
  // @ts-expect-error
  const { default: youchTerminal } = await import("youch-terminal");
  const { default: Youch } = await import("youch");
  const youch = new Youch(error, {});
  logger.error(youchTerminal(await youch.toJSON(), { displayShortPath: true }));
}

export const inspect = (i: unknown) =>
  logger.info(nodeInspect(i, { depth: 20, colors: true }));

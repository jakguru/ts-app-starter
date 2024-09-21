import cla from "command-line-args";
import clu from "command-line-usage";
import joi from "joi";

import { logger, logCompletePromise } from "../providers/logger";

const options = [
  /**
   * This is where you define the options for the script
   */
  {
    name: "help",
    alias: "h",
    type: Boolean,
    description: "Print this usage guide",
  },
];

interface Options {
  destination: string;
  desinationPacketSize: number;
  ffmpegDebugLevel: string;
}

interface Arguments extends Options {
  help: boolean;
}

const optionsSchema = joi.object<Arguments>({
  help: joi.boolean().optional().default(false),
  /**
   * This is where you define the schema for the options
   */
});

const args = cla(options);
const usage = clu([
  {
    header: "Example script",
    content: "An example script which will do something",
  },
  {
    header: "Options",
    optionList: options,
  },
]);

export const scriptAbortController = new AbortController();

export const cleanup = async () => {
  await Promise.all([logCompletePromise]);
  scriptAbortController.abort();
};

export const run = async () => {
  const { error, value: opts } = optionsSchema.validate(args);
  if (error) {
    logger.error(error.message);
    logger.info(usage);
    return;
  }
  if (opts.help) {
    logger.info(usage);
    return;
  }
  return Object.assign(
    {},
    ...Object.keys(opts)
      .filter((k) => "help" !== k)
      .map((k) => ({ [k]: opts[k as keyof Options] })),
  ) as Options;
};

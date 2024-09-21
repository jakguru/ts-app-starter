import { Env } from "@nestmtx/config";
import Joi from "joi";

import type { EnvSchema } from "@nestmtx/config";

const envSchema: EnvSchema = {
  LOG_LEVEL: Joi.string()
    .allow(
      "emerg",
      "alert",
      "crit",
      "error",
      "warning",
      "notice",
      "info",
      "debug",
    )
    .default("info"),
};

export const env = new Env(envSchema);

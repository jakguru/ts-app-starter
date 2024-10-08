import "reflect-metadata";
import * as sourceMapSupport from "source-map-support";
import { prettyPrintError, inspect } from "./providers/logger";
import { cleanup, run, scriptAbortController } from "./services/cli";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { Config } from "@nestmtx/config";

sourceMapSupport.install({
  handleUncaughtExceptions: false,
  hookRequire: true,
  environment: "node",
});

const CURRENT_FILENAME = fileURLToPath(import.meta.url);
const BASEDIR = dirname(CURRENT_FILENAME);
const CONFIG_DIR = resolve(BASEDIR, "config");

process
  .on("unhandledRejection", (reason, p) => {
    console.error(reason, "Unhandled Rejection at Promise", p);
  })
  .on("uncaughtException", (err) => {
    console.error(err.stack);
    cleanup().finally(() => process.exit(1));
  })
  .on("SIGINT", () => {
    scriptAbortController.abort();
    cleanup().finally(() => process.exit(255));
  })
  .on("SIGTERM", () => {
    scriptAbortController.abort();
    cleanup().finally(() => process.exit(255));
  });

run()
  .then(async (opts) => {
    if (!opts) {
      return;
    }
    let config: Config | undefined;
    if (existsSync(CONFIG_DIR)) {
      config = await Config.initialize(CONFIG_DIR);
    }
    /**
     * This is the main entry point of the script
     */
    inspect({
      baseDir: BASEDIR,
      opts,
      config,
    });
  })
  .catch((err) => {
    prettyPrintError(err);
    cleanup().finally(() => process.exit(1));
  });

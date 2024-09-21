import { resolve, sep } from "path";
import { defineConfig } from "vite";
import { readFile, readdir } from "fs/promises";

import type { UserConfig } from "vite";

const BASE_DIR = resolve(__dirname);
const SRC_DIR = resolve(BASE_DIR, "src");
const externals = new Set<string>([
  "node:util",
  "node:path",
  "node:url",
  "node:fs",
  "node:fs/promises",
]);
const nonExternal = new Set<string>([]);

export default defineConfig(async () => {
  const configDir = resolve(SRC_DIR, "config");
  const configEntries: Record<string, string> = {};
  const filesInConfigFolder = await readdir(configDir);
  filesInConfigFolder.forEach((file) => {
    if (!file.endsWith(".ts")) {
      return;
    }
    const name = file.replace(/\.ts$/, "");
    const key = ["config", name].join(sep);
    configEntries[key] = resolve(configDir, file);
  });
  const rawPackageJson = await readFile(
    resolve(BASE_DIR, "package.json"),
    "utf-8",
  );
  const packageJson = JSON.parse(rawPackageJson.toString());
  if (packageJson.dependencies) {
    Object.keys(packageJson.dependencies).forEach((dep) => {
      externals.add(dep);
    });
  }
  const external = Array.from(externals).filter((ext) => !nonExternal.has(ext));
  return {
    plugins: [],
    build: {
      sourcemap: true,
      minify: false,
      lib: {
        entry: {
          index: resolve(SRC_DIR, "index.ts"),
          env: resolve(SRC_DIR, "env.ts"),
          ...configEntries,
        },
        name: "@example/script",
        formats: ["es", "cjs"],
        fileName: (format: string, entry: string) => {
          switch (format) {
            case "es":
              return `${entry}.mjs`;
            case "cjs":
              return `${entry}.cjs`;
            default:
              return `${entry}.${format}.js`;
          }
        },
      },
      rollupOptions: {
        external,
        output: {
          exports: "named",
        },
        treeshake: "safest",
      },
      emptyOutDir: false,
    },
    define: {},
  } as UserConfig;
});

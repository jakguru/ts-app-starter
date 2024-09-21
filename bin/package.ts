import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";

const BASE_DIR = resolve(__dirname, "..");
const packageJsonPath = resolve(BASE_DIR, "package.json");
const destPackageJsonPath = resolve(BASE_DIR, "dist/package.json");

readFile(packageJsonPath, "utf-8").then(async (packageJson) => {
  const parsedPackageJson = JSON.parse(packageJson);
  parsedPackageJson.type = "module";
  if (!parsedPackageJson.dependencies) {
    parsedPackageJson.dependencies = {};
  }
  delete parsedPackageJson.devDependencies;
  delete parsedPackageJson.scripts;
  parsedPackageJson.module = parsedPackageJson.module.replace("./dist/", "./");
  parsedPackageJson.main = parsedPackageJson.main.replace("./dist/", "./");
  for (const key of Object.keys(parsedPackageJson.exports)) {
    const fixedKey = key.replace("./dist/", "./");
    const value = parsedPackageJson.exports[key];
    if ("string" === typeof value) {
      parsedPackageJson.exports[fixedKey] = value.replace("./dist/", "./");
    } else if (
      "object" === typeof value &&
      !Array.isArray(value) &&
      null !== value
    ) {
      for (const subKey of Object.keys(value)) {
        const subValue = value[subKey];
        if ("string" === typeof subValue) {
          value[subKey] = subValue.replace("./dist/", "./");
        }
      }
      parsedPackageJson.exports[fixedKey] = value;
    }
    if (key !== fixedKey) {
      delete parsedPackageJson.exports[key];
    }
  }
  delete parsedPackageJson.files;
  await writeFile(
    destPackageJsonPath,
    JSON.stringify(parsedPackageJson, null, 2),
  );
});

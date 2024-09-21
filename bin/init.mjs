#!/usr/bin/env node

import { execSync } from "child_process";
import { createWriteStream } from "fs";
import { mkdirSync, rmSync, existsSync } from "fs";
import { createInterface } from "readline";
import { get } from "https";
import { pipeline } from "stream";
import { promisify } from "util";
import { tmpdir } from "os";
import { join, resolve } from "path";
import { URL } from "url";

// Promisify pipeline for modern usage
const streamPipeline = promisify(pipeline);

// Helper to ask user input
const askQuestion = (query) => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    }),
  );
};

// Function to download a file and follow redirects
const downloadFile = async (url, destination) => {
  const file = createWriteStream(destination);

  const download = (url, resolve, reject) => {
    const options = new URL(url);

    get(options, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        download(response.headers.location, resolve, reject);
      } else if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file: ${response.statusCode}`));
      } else {
        streamPipeline(response, file).then(resolve).catch(reject);
      }
    }).on("error", reject);
  };

  return new Promise((resolve, reject) => download(url, resolve, reject));
};

// Function to check if Node.js version is at least 22
const checkNodeVersion = () => {
  const version = process.version.slice(1); // Remove the 'v' from the version string
  const majorVersion = parseInt(version.split(".")[0], 10); // Extract the major version
  if (majorVersion < 22) {
    console.error(
      `Node.js version 22 or higher is required. You are using version ${process.version}.`,
    );
    process.exit(1); // Exit the script if the version is not sufficient
  }
};

// Main function
(async () => {
  checkNodeVersion(); // Check Node.js version

  const ZIP_URL =
    "https://github.com/jakguru/ts-app-starter/archive/refs/heads/main.zip";
  const TMP_DIR = tmpdir();
  const ZIP_FILE = join(TMP_DIR, "ts-app-starter.zip");
  const EXTRACT_DIR = join(TMP_DIR, "ts-app-starter-main");
  rmSync(EXTRACT_DIR, { recursive: true, force: true });

  try {
    // Ask for the destination directory
    let destinationDir = await askQuestion(
      "Enter the destination directory to extract the project: ",
    );

    // Resolve the destination directory to an absolute path
    destinationDir = resolve(destinationDir);

    // Check if the destination directory exists
    if (existsSync(destinationDir)) {
      const overwrite = await askQuestion(
        "Directory already exists. Overwrite? (y/n): ",
      );
      if (overwrite.toLowerCase() === "y") {
        rmSync(destinationDir, { recursive: true, force: true });
        console.log("Removed existing directory.");
      } else {
        console.log("Exiting.");
        process.exit(0);
      }
    }

    mkdirSync(destinationDir, { recursive: true });

    // Download the zip file
    console.log(`Downloading zip file from ${ZIP_URL}...`);
    await downloadFile(ZIP_URL, ZIP_FILE);
    console.log("Download complete.");

    // Extract the ZIP file using the native 'unzip' command
    console.log(`Extracting ${ZIP_FILE} to ${EXTRACT_DIR}...`);
    execSync(`unzip -q ${ZIP_FILE} -d ${TMP_DIR}`);
    console.log("Extraction complete.");

    // Move the extracted directory to the destination
    execSync(`mv ${EXTRACT_DIR}/* ${destinationDir}`);
    console.log(`Moved extracted files to ${destinationDir}.`);

    // Ask for the preferred package manager
    const pmOption = await askQuestion(
      "Which package manager would you like to use to install dependencies?\n1. npm\n2. yarn\n3. pnpm\nEnter the number (1, 2, or 3): ",
    );

    let pm;
    switch (pmOption) {
      case "1":
        pm = "npm";
        break;
      case "2":
        pm = "yarn";
        break;
      case "3":
        pm = "pnpm";
        break;
      default:
        console.log("Invalid option. Exiting.");
        process.exit(1);
    }

    // Change directory to the destination
    process.chdir(destinationDir);

    // Install dependencies using the selected package manager
    console.log(`Installing dependencies using ${pm}...`);
    execSync(`${pm} install`, { stdio: "inherit", cwd: destinationDir });
    console.log("Dependencies installed successfully.");

    // Clean up the zip file
    rmSync(ZIP_FILE);
    rmSync(EXTRACT_DIR, { recursive: true, force: true });
    rmSync(join(destinationDir, "bin", "init.mjs"));
    rmSync(join(destinationDir, "README.md"));
    rmSync(join(destinationDir, "LICENSE.md"));
    console.log("Project setup complete. Cleaned up the zip file.");
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
})();

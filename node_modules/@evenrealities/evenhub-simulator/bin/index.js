#!/usr/bin/env node
const { execFileSync } = require("child_process");

const platform = process.platform;
const arch = process.arch;
const binName = platform === "win32" ? "evenhub-simulator.exe" : "evenhub-simulator";

let binPath;
try {
  binPath = require.resolve(`@evenrealities/sim-${platform}-${arch}/bin/${binName}`);
} catch {
  console.error(`Unsupported platform: ${platform}-${arch}`);
  process.exit(1);
}

try {
  execFileSync(binPath, process.argv.slice(2), { stdio: "inherit" });
} catch (e) {
  process.exit(e.status || 1);
}

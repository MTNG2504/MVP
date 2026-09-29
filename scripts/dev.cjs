const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const adminEntry = path.join(root, "admin", "src", "app.js");

if (!fs.existsSync(nextBin)) {
  console.error("Next.js is not installed. Run npm install from the project root.");
  process.exit(1);
}

if (!fs.existsSync(adminEntry)) {
  console.error("Admin workspace was not found at admin/src/app.js.");
  process.exit(1);
}

const children = [];
let shuttingDown = false;

function start(label, script, cwd) {
  const child = spawn(process.execPath, [script], {
    cwd,
    stdio: "inherit",
    env: process.env,
  });

  children.push(child);

  child.on("error", (error) => {
    console.error(`[${label}] ${error.message}`);
    shutdown(1);
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown || signal) {
      return;
    }
    if (code) {
      console.error(`[${label}] stopped with exit code ${code}`);
      shutdown(code);
    }
  });
}

function shutdown(exitCode) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;

  for (const child of children) {
    if (!child.pid) {
      continue;
    }
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], { stdio: "ignore" });
    } else {
      child.kill("SIGTERM");
    }
  }

  setTimeout(() => process.exit(exitCode), 300);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

console.log("Coin Rich: http://localhost:3000");
console.log("Admin:     http://localhost:3001");

start("main", nextBin, root);
start("admin", adminEntry, path.join(root, "admin"));

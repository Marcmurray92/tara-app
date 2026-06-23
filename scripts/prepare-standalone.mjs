import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");
const publicDir = path.join(root, "public");
const staticDir = path.join(root, ".next", "static");

async function copyIfPresent(source, destination) {
  try {
    await fs.access(source);
  } catch {
    return;
  }

  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.cp(source, destination, { recursive: true });
}

await copyIfPresent(publicDir, path.join(standaloneDir, "public"));
await copyIfPresent(staticDir, path.join(standaloneDir, ".next", "static"));


import { spawn } from "node:child_process";

const port = process.env.PORT ?? "3000";
const server = spawn(
  process.execPath,
  [".next/standalone/server.js"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      HOSTNAME: "0.0.0.0",
      PORT: port
    }
  }
);

server.on("exit", (code) => {
  process.exit(code ?? 0);
});

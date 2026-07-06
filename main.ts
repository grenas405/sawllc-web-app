/**
 * main.ts — entry point. Load config, start the server. Nothing else.
 */

import { loadConfig } from "./src/config.ts";
import { startServer } from "./src/server.ts";

if (import.meta.main) {
  const config = loadConfig();
  console.log(`SCF AutoWorks web — http://${config.hostname}:${config.port}`);
  await startServer(config);
}

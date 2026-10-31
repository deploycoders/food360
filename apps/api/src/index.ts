import "dotenv/config";
import { log } from "@repo/logger";
import { createServer } from "./server.js";

const port = process.env.PORT || 3002;

const server = createServer();

server.listen(port, () => {
  log(`api running on ${port}`);
});

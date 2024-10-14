import config from "config";
import createServer from "./server";
import logger from "./utils/logger";

const app = createServer();

const hostname: string = config.get("hostname");
const port: number = config.get("port");

app.listen(port, hostname, async () => {
  logger.info(`Listening on http://${hostname}:${port}`);
});

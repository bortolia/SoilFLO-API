import createServer from "./server";
import logger from "./utils/logger";

const app = createServer();

const hostname: string = "127.0.0.1";
const port: number = 3003;

app.listen(port, hostname, async () => {
  logger.info(`Listening on http://${hostname}:${port}`);
});

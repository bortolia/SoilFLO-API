import createServer from "./server";

const app = createServer();

const hostname: string = "127.0.0.1";
const port: number = 3003;

app.listen(port, hostname, async () => {
  console.log(`Listening on http://${hostname}:${port}`);
});

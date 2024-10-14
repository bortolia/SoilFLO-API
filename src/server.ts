import express, { Request, Response } from "express";
import { sequelize } from "./model";
import promClient from "prom-client";
import ticketRouter from "./routes/ticketRouter";
import { httpRequestDurationMilliseconds } from "./metrics/promMetrics";
import requestDuration from "./middleware/promMiddleware";

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const createServer = () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.set("sequelize", sequelize);
  app.set("models", sequelize.models);

  // Capturing request duration with prometheus
  register.registerMetric(httpRequestDurationMilliseconds);
  app.use(requestDuration);

  // Defining routes
  app.use("/api/tickets", ticketRouter);

  // Exposing prometheus metrics for observability
  app.get("/metrics", async (req: Request, res: Response) => {
    res.setHeader("Content-Type", register.contentType);
    res.send(await register.metrics());
  });

  return app;
};

export default createServer;

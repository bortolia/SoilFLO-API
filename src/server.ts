import express from "express";
import basicAuth from "express-basic-auth";
import { sequelize } from "./model";
import ticketRouter from "./routes/ticketRouter";

const createServer = () => {
  const app = express();
  app.use(
    basicAuth({
      users: { admin: "secret123" },
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.set("sequelize", sequelize);
  app.set("models", sequelize.models);

  // Defining routes
  app.use("/api/tickets", ticketRouter);

  return app;
};

export default createServer;

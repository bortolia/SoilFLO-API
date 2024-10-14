import express from "express";
import { createBulkTicketHandler, fetchTicketsHandler } from "../controller/ticketController";
import validateRequest from "../middleware/validateRequest";
import { createBulkTicketSchema, fetchTicketsSchema } from "../schema/ticketSchema";
import config from "config";
import basicAuth from "express-basic-auth";

const user: string = config.get("user");
const secret: string = config.get("password");
const ticketRouter: express.Router = express.Router();

ticketRouter.post(
  "/bulk",
  basicAuth({ users: { [user]: secret } }),
  validateRequest(createBulkTicketSchema),
  createBulkTicketHandler
);
ticketRouter.get(
  "/",
  basicAuth({ users: { [user]: secret } }),
  validateRequest(fetchTicketsSchema),
  fetchTicketsHandler
);

export default ticketRouter;

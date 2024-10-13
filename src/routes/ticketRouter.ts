import express from "express";
import { createBulkTicketHandler, fetchTicketsHandler } from "../controller/ticketController";
import validateRequest from "../middleware/validateRequest";
import { createBulkTicketSchema, fetchTicketsSchema } from "../schema/ticketSchema";

const ticketRouter: express.Router = express.Router();

ticketRouter.post("/bulk", validateRequest(createBulkTicketSchema), createBulkTicketHandler);
ticketRouter.get("/", validateRequest(fetchTicketsSchema), fetchTicketsHandler);

export default ticketRouter;

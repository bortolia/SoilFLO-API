import express from "express";
import { createBulkTicketHandler } from "../controller/ticketController";
import validateRequest from "../middleware/validateRequest";
import { createBulkTicketSchema } from "../schema/ticketSchema";

const ticketRouter: express.Router = express.Router();

ticketRouter.post("/bulk", validateRequest(createBulkTicketSchema), createBulkTicketHandler);

export default ticketRouter;

import express from "express";
import { createBulkTicketHandler } from "../controller/ticketController";

const ticketRouter: express.Router = express.Router();

ticketRouter.post("/bulk", createBulkTicketHandler);

export default ticketRouter;

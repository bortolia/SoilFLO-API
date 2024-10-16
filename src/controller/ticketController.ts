import { Request, Response } from "express";
import dayjs from "dayjs";
import { sequelize, Ticket } from "../model";
import { TICKET_MATERIAL } from "../../common/types";
import { Model, Op, Transaction } from "sequelize";
import { CreateBulkTicketInput, FetchTicketsInput } from "../schema/ticketSchema";
import {
  isValidDispatchedTime,
  doesDispatchedTimeExist,
  createTickets,
  generateDateFilter,
  generateSitesFilter,
  findAllTickets,
  formatTickets,
} from "../service/ticketService";
import logger from "../utils/logger";

export const createBulkTicketHandler = async (req: Request, res: Response) => {
  logger.info({ req: req.body }, "input: ticketController.createBulkTicketHandler");
  try {
    const bulkTicketReq: CreateBulkTicketInput = req;
    const { truckId, tickets } = bulkTicketReq.body;

    const seenDate = new Set<string>();

    for (const ticket of tickets) {
      const { dispatchedTime, siteId } = ticket;

      // Validate if the dispatchedTime is valid for this ticket. Throws if not valid
      isValidDispatchedTime(dispatchedTime);

      // Check seenDate for duplicate dispatchedTime within this request
      if (seenDate.has(ticket.dispatchedTime)) {
        throw new Error("Tickets with the same dispatchedTime cannot be created");
      }
      seenDate.add(ticket.dispatchedTime);

      // Validate if the dispatchedTime already exists for the given truckId. Throws if already exists
      await doesDispatchedTimeExist(truckId, dispatchedTime);
    }

    let createdTickets: Model[] = [];
    await sequelize.transaction(
      {
        isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
      },
      async (t: Transaction) => {
        createdTickets = await createTickets(tickets, truckId, t);
      }
    );

    logger.info({ createdTickets }, "out: ticketController.createBulkTicketHandler");
    res.status(201).json(createdTickets);
    return;
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send({ msg: error.message });
    } else {
      res.status(500).send({ msg: error });
    }
  }
};

export const fetchTicketsHandler = async (req: Request, res: Response) => {
  logger.info({ req: req.query }, "input: ticketController.fetchTicketsHandler");
  try {
    const fetchTickets: FetchTicketsInput = req;
    const { sites, startDate, endDate } = fetchTickets.query;

    // Generate filters for query
    const sitesFilter = generateSitesFilter(sites);
    const dateFilter = generateDateFilter(startDate, endDate);

    // Find all tickets utilizing (optional) filters
    const allTickets = await findAllTickets(sitesFilter, dateFilter);

    // Format output to spec
    const formattedTickets = await formatTickets(allTickets);

    logger.info({ formattedTickets }, "out: ticketController.fetchTicketsHandler");
    res.status(200).json(formattedTickets);
    return;
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send({ msg: error.message });
    } else {
      res.status(500).send({ msg: error });
    }
  }
};

import dayjs from "dayjs";
import logger from "../utils/logger";
import { Ticket } from "../model";
import { Model, Op, Transaction } from "sequelize";
import { TICKET_MATERIAL, BulkTicket } from "../../common/types";

const isValidDispatchedTime = (dispatchedTime: string): boolean | void => {
  logger.info({ dispatchedTime }, "Input: ticketService.isValidDispatchedTime");

  const date = dayjs(dispatchedTime);

  let isValid = dispatchedTime !== undefined && date.isValid();
  if (!isValid) {
    throw new Error("Invalid Date");
  }

  isValid = isValid && !date.isAfter(dayjs());
  if (!isValid) {
    throw new Error("Ticket cannot be dispatched for a future date");
  }

  logger.info({ isValid }, "Output: ticketService.isValidDispatchedTime");
  return isValid;
};

const doesDispatchedTimeExist = async (
  truckId: number,
  dispatchedTime: string
): Promise<boolean | void> => {
  // Check for duplicate dispatchedTime
  logger.info({ truckId, dispatchedTime }, "Input: ticketService.doesDispatchedTimeExist");

  const duplicateTicket = await Ticket.findOne({
    where: {
      truckId,
      dispatchedTime: { [Op.eq]: dayjs(dispatchedTime).toISOString() },
    },
  });

  if (duplicateTicket) {
    throw new Error(
      `Ticket dispatchedTime (${dayjs(
        dispatchedTime
      ).toISOString()}) already exists for same truckId (${truckId})`
    );
  }

  logger.info(
    { doesDispatchedTimeExist: Boolean(duplicateTicket) },
    "out: ticketService.doesDispatchedTimeExist"
  );
  return Boolean(duplicateTicket);
};

const createTickets = async (tickets: BulkTicket[], truckId: number, tx: Transaction) => {
  logger.info({ tickets, truckId }, "Input: ticketService.createTickets");

  const ticketList: Model[] = [];
  for (const ticket of tickets) {
    const newTicket = await Ticket.create(
      {
        siteId: ticket.siteId,
        truckId,
        dispatchedTime: dayjs(ticket.dispatchedTime).toISOString(),
        material: TICKET_MATERIAL.Soil,
      },
      { transaction: tx }
    );
    ticketList.push(newTicket);
  }

  logger.info({ ticketList }, "Output: ticketService.createTickets");
  return ticketList;
};

export { isValidDispatchedTime, doesDispatchedTimeExist, createTickets };

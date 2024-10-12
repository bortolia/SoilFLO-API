import { Request, Response } from "express";
import dayjs from "dayjs";
import { Ticket } from "../model";
import { BulkTicketCreateRequest, TICKET_MATERIAL } from "../../common/types";
import { Model, Op } from "sequelize";

export const createBulkTicketHandler = async (req: Request, res: Response) => {
  try {
    const bulkTicketReq: BulkTicketCreateRequest = req.body;
    const { truckId, tickets } = bulkTicketReq;

    const seenDate = new Set<Date>();

    for (const ticket of tickets) {
      const { dispatchedTime, siteId } = ticket;

      // Validate dispatchedTime
      const date = dayjs(dispatchedTime);

      if (!date.isValid() || dispatchedTime == undefined) {
        throw new Error("Invalid Date");
      }
      if (date.isAfter(dayjs())) {
        throw new Error("Tickets cannot be dispatched at a future dates");
      }

      // Check set for duplicate dispatched times within this request
      if (seenDate.has(ticket.dispatchedTime)) {
        throw new Error("Tickets with the same dispatchedTime cannot be created");
      }
      seenDate.add(ticket.dispatchedTime);

      // Check for duplicate dispatchedTime
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
    }

    const ticketArr: Model[] = [];
    for (const ticket of tickets) {
      const newTicket = await Ticket.create({
        siteId: ticket.siteId,
        truckId,
        dispatchedTime: dayjs(ticket.dispatchedTime).toISOString(),
        material: TICKET_MATERIAL.Soil,
      });
      ticketArr.push(newTicket);
    }

    res.status(201).json(ticketArr);
    return;
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send({ msg: error.message });
    } else {
      res.status(500).send({ msg: error });
    }
  }
};

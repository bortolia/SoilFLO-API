import dayjs from "dayjs";
import logger from "../utils/logger";
import { Ticket } from "../model";
import { Model, Op, Transaction } from "sequelize";
import { TICKET_MATERIAL, BulkTicket, IFetchAllTicketsFormatted } from "../../common/types";

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

const generateDateFilter = (start: string | undefined, end: string | undefined): Object => {
  logger.info({ start, end }, "Input: ticketService.generateDateFilter");
  let filter: any = {};
  if (start && end) {
    filter.dispatchedTime = {
      [Op.between]: [dayjs(start).toISOString(), dayjs(end).toISOString()],
    };
  } else if (start && !end) {
    filter.dispatchedTime = {
      [Op.gte]: dayjs(start).toISOString(),
    };
  } else if (!start && end) {
    filter.dispatchedTime = {
      [Op.lte]: dayjs(end).toISOString(),
    };
  }

  logger.info({ filter }, "out: ticketService.generateDateFilter");
  return filter;
};

const generateSitesFilter = (sites: string | undefined): Object => {
  logger.info({ sites }, "Input: ticketService.generateSitesFilter");
  let filter: any = {};

  if (sites) {
    const sitesArray = sites.split(",").map(Number);
    const noDuplicateSitesArray = [...new Set(sitesArray)];
    filter.siteId = {
      [Op.in]: noDuplicateSitesArray,
    };
  }
  logger.info({ filter }, "output: ticketService.generateSitesFilter");
  return filter;
};

const findAllTickets = async (sitesFilter: Object, dateFilter: Object): Promise<Model[]> => {
  logger.info({ sitesFilter, dateFilter }, "Input: ticketService.findAllTickets");

  const tickets: Model[] = await Ticket.findAll({
    where: {
      ...sitesFilter,
      ...dateFilter,
    },
  });

  logger.info({ tickets }, "output: ticketService.findAllTickets");
  return tickets;
};

const formatTickets = async (tickets: Model[]): Promise<IFetchAllTicketsFormatted[]> => {
  logger.info({ tickets }, "Input: ticketService.formatTickets");

  const siteDictionary = new Map<number, any>();
  const truckDictionary = new Map<number, any>();
  const result: IFetchAllTicketsFormatted[] = [];

  for (const ticket of tickets) {
    let tempSite: any;
    let tempTruck: any;
    let tempResult: IFetchAllTicketsFormatted = {};

    // Getting Site Info
    if (siteDictionary.has(ticket.dataValues.siteId)) {
      tempSite = siteDictionary.get(ticket.dataValues.siteId);
    } else {
      //@ts-ignore
      tempSite = await ticket.getSite();
      siteDictionary.set(ticket.dataValues.siteId, tempSite.dataValues);
    }
    tempResult = { ...tempResult, siteName: tempSite.name };

    // Getting Truck Info
    if (truckDictionary.has(ticket.dataValues.truckId)) {
      tempTruck = truckDictionary.get(ticket.dataValues.truckId);
    } else {
      //@ts-ignore
      tempTruck = await ticket.getTruck();
      truckDictionary.set(ticket.dataValues.truckId, tempTruck.dataValues);
    }
    tempResult = { ...tempResult, truckLicense: tempTruck.license };

    // Appending Ticket Info
    tempResult = {
      ...tempResult,
      ticketNumber: ticket.dataValues.ticketNumber,
      ticketDispatchedTime: ticket.dataValues.dispatchedTime,
      ticketMaterial: ticket.dataValues.material,
    };

    result.push(tempResult);
  }

  logger.info({ result }, "output: ticketService.formatTickets");
  return result;
};

export {
  isValidDispatchedTime,
  doesDispatchedTimeExist,
  createTickets,
  generateDateFilter,
  generateSitesFilter,
  findAllTickets,
  formatTickets,
};

import { object, number, array, string, union, TypeOf, optional } from "zod";

export const createBulkTicketSchema = object({
  body: object({
    truckId: number({
      required_error: "truckId is required",
    }).int(),
    tickets: array(
      object({
        dispatchedTime: union([string().date(), string().datetime({ offset: true })]),
        siteId: number({
          required_error: "siteId is required",
        }).int(),
      }),
      { required_error: "tickets array is required" }
    ).min(1, "Must contain at least 1 ticket"),
  }),
});

export const fetchTicketsSchema = object({
  query: object({
    sites: string()
      .regex(/^\d+(,\d+)*$/, "provide sites seperated by commas (ie. 1,21)")
      .optional(),
    startDate: union([string().date(), string().datetime({ offset: true })]).optional(),
    endDate: union([string().date(), string().datetime({ offset: true })]).optional(),
  }),
});

export type CreateBulkTicketInput = TypeOf<typeof createBulkTicketSchema>;
export type FetchTicketsInput = TypeOf<typeof fetchTicketsSchema>;

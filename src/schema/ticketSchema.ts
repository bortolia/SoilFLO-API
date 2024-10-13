import { object, number, array, string, union, TypeOf } from "zod";

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

export type CreateBulkTicketInput = TypeOf<typeof createBulkTicketSchema>;

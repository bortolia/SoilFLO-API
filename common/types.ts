export enum TICKET_MATERIAL {
  "Soil" = "Soil",
}

export interface BulkTicket {
  dispatchedTime: string;
  siteId: number;
}

export interface BulkTicketCreateRequest {
  truckId: number;
  tickets: [BulkTicket];
}

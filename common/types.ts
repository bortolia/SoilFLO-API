export enum TICKET_MATERIAL {
  "Soil" = "Soil",
}

export interface BulkTicketCreateRequest {
  truckId: number;
  tickets: [
    {
      dispatchedTime: Date;
      siteId: number;
    }
  ];
}

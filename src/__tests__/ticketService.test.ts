import dayjs from "dayjs";
import * as ticketService from "../../src/service/ticketService";
import { Ticket } from "../model";
import { Op } from "sequelize";

describe("ticketService", () => {
  describe("isValidDispatchedTime", () => {
    describe("given the dispatchedTime is valid", () => {
      it("should return true", () => {
        const dispatchedTime = dayjs("2021-12-31").toISOString();
        const isValid = ticketService.isValidDispatchedTime(dispatchedTime);

        expect(isValid).toBe(true);
      });
    });

    describe("given the dispatchedTime is not a valid date", () => {
      it("should throw 'Invalid Date'", () => {
        const dispatchedTime = "";
        const isValidThrow = () => ticketService.isValidDispatchedTime(dispatchedTime);

        expect(isValidThrow).toThrow("Invalid Date");
      });
    });

    describe("given the dispatchedTime is a future date", () => {
      it("should throw 'Ticket cannot be dispatched for a future date'", () => {
        const dispatchedTime = dayjs().add(1, "year").toISOString();
        const isValidThrow = () => ticketService.isValidDispatchedTime(dispatchedTime);

        expect(isValidThrow).toThrow("Ticket cannot be dispatched for a future date");
      });
    });
  });

  describe("doesDispatchedTimeExist", () => {
    describe("given the dispatchedTime DOES NOT exist for the given truckId", () => {
      it("should return false", async () => {
        const truckId = 1;
        const dispatchedTime = "2024-01-28 04:00:00.000 +00:00";
        const mockReturnValue = null;

        // Resolving to null indicates that no Ticket was found for given truckId and dispatchedTime
        const mockFindOne = jest.spyOn(Ticket, "findOne").mockResolvedValue(mockReturnValue);

        const result = await ticketService.doesDispatchedTimeExist(truckId, dispatchedTime);

        expect(mockFindOne).toHaveBeenCalledTimes(1);
        expect(result).toBe(false);
      });
    });

    describe("given the dispatchedTime DOES exist for the given truckId", () => {
      it("should throw 'Ticket dispatchedTime already exists for same truckId'", async () => {
        const truckId = 1;
        const dispatchedTime = "2024-06-28T04:00:00.910Z";
        const mockTicket = {
          id: 1,
          ticketNumber: 1,
          dispatchedTime: "2024-06-28T04:00:00.910Z",
          material: "Soil",
          createdAt: "2024-10-10T01:24:09.508Z",
          updatedAt: "2024-10-10T01:24:09.508Z",
          truckId: 11,
          siteId: 21,
        };

        //@ts-ignore
        const mockFindOne = jest.spyOn(Ticket, "findOne").mockResolvedValue(mockTicket);

        const result = async () =>
          await ticketService.doesDispatchedTimeExist(truckId, dispatchedTime);

        const errorMsg = `Ticket dispatchedTime (${dispatchedTime}) already exists for same truckId (${truckId})`;
        expect(result).rejects.toThrow(errorMsg);
        expect(mockFindOne).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("createTickets", () => {
    describe("given the bulk ticket creation array and truckId", () => {
      it("should return an array of created tickets", async () => {
        const bulkTickets = [
          { dispatchedTime: "2024-01-05T04:00:00.010Z", siteId: 1 },
          { dispatchedTime: "2024-06-05T04:00:00.010Z", siteId: 21 },
        ];
        const truckid = 1;
        const mockReturnValue1 = {
          id: 15,
          siteId: 1,
          truckId: 1,
          dispatchedTime: "2024-01-05T04:00:00.010Z",
          material: "Soil",
          updatedAt: "2024-10-14T04:23:30.236Z",
          createdAt: "2024-10-14T04:23:30.236Z",
          ticketNumber: 12,
        };
        const mockReturnValue2 = {
          id: 16,
          siteId: 21,
          truckId: 1,
          dispatchedTime: "2024-06-05T04:00:00.010Z",
          material: "Soil",
          updatedAt: "2024-10-14T04:23:30.271Z",
          createdAt: "2024-10-14T04:23:30.271Z",
          ticketNumber: 2,
        };

        const expectedReturnValue = [
          {
            id: 15,
            siteId: 1,
            truckId: 1,
            dispatchedTime: "2024-01-05T04:00:00.010Z",
            material: "Soil",
            updatedAt: "2024-10-14T04:23:30.236Z",
            createdAt: "2024-10-14T04:23:30.236Z",
            ticketNumber: 12,
          },
          {
            id: 16,
            siteId: 21,
            truckId: 1,
            dispatchedTime: "2024-06-05T04:00:00.010Z",
            material: "Soil",
            updatedAt: "2024-10-14T04:23:30.271Z",
            createdAt: "2024-10-14T04:23:30.271Z",
            ticketNumber: 2,
          },
        ];

        // Resolving to mock tickets from db
        const mockCreate = jest
          .spyOn(Ticket, "create")
          .mockResolvedValueOnce(mockReturnValue1)
          .mockResolvedValueOnce(mockReturnValue2);

        const result = await ticketService.createTickets(bulkTickets, truckid, null!);

        expect(mockCreate).toHaveBeenCalledTimes(2);
        expect(result).toHaveLength(2);
        expect(result).toEqual(expectedReturnValue);
      });
    });
  });

  describe("generateDateFilter", () => {
    describe("given a startDate and endDate", () => {
      it("should return a sequelize between filter", async () => {
        const startDate = "2024-01-01";
        const endDate = "2024-02-01";
        const expectedFilter = {
          dispatchedTime: {
            [Op.between]: [dayjs(startDate).toISOString(), dayjs(endDate).toISOString()],
          },
        };

        const dateFilter = ticketService.generateDateFilter(startDate, endDate);

        expect(dateFilter).toEqual(expectedFilter);
      });
    });

    describe("given a startDate only", () => {
      it("should return a sequelize gte filter", async () => {
        const startDate = "2024-01-01";
        const endDate = undefined;
        const expectedFilter = {
          dispatchedTime: {
            [Op.gte]: dayjs(startDate).toISOString(),
          },
        };

        const dateFilter = ticketService.generateDateFilter(startDate, endDate);

        expect(dateFilter).toEqual(expectedFilter);
      });
    });

    describe("given undefined values", () => {
      it("should return no filter (empty)", async () => {
        const startDate = undefined;
        const endDate = undefined;
        const expectedFilter = {};

        const dateFilter = ticketService.generateDateFilter(startDate, endDate);

        expect(dateFilter).toEqual(expectedFilter);
      });
    });
  });

  describe("generateSitesFilter", () => {
    describe("given a list of sites", () => {
      it("should return a sequelize IN filter", async () => {
        const sites = "1,2,3";
        const expectedFilter = {
          siteId: {
            [Op.in]: [1, 2, 3],
          },
        };

        const siteFilter = ticketService.generateSitesFilter(sites);

        expect(siteFilter).toEqual(expectedFilter);
      });
    });

    describe("given a list of sites with repeated values", () => {
      it("should return a sequelize IN filter without repeated values", async () => {
        const sites = "1,2,3,3,2,1,1";
        const expectedFilter = {
          siteId: {
            [Op.in]: [1, 2, 3],
          },
        };

        const siteFilter = ticketService.generateSitesFilter(sites);

        expect(siteFilter).toEqual(expectedFilter);
      });
    });
  });
});

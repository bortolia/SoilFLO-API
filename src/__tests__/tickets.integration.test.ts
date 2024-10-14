import supertest from "supertest";
import createServer from "../server";
import { Ticket } from "../model";
import config from "config";

const app = createServer();

describe("Tickets Integration", () => {
  describe("create tickets in bulk for a truck", () => {
    describe("given a valid input", () => {
      it("should return 201 and created ticket objects", async () => {
        const authBase64 = `${config.get("user")}:${config.get("password")}`;
        const mockInputBody = {
          truckId: 1,
          tickets: [{ dispatchedTime: "2024-01-05T04:00:00.010Z", siteId: 11 }],
        };
        const mockCreateTicketsValue = {
          id: 15,
          siteId: 11,
          truckId: 1,
          dispatchedTime: "2024-01-05T04:00:00.010Z",
          material: "Soil",
          updatedAt: "2024-10-14T04:23:30.236Z",
          createdAt: "2024-10-14T04:23:30.236Z",
          ticketNumber: 12,
        };

        jest.mock("../model", () => {
          return {
            sequelize: {
              transaction: jest.fn(() => ({
                commit: jest.fn(),
                rollback: jest.fn(),
              })),
            },
          };
        });

        const mockFindOne = jest.spyOn(Ticket, "findOne").mockResolvedValue(null);
        const mockCreate = jest.spyOn(Ticket, "create").mockResolvedValue(mockCreateTicketsValue);

        const { statusCode, body } = await supertest(app)
          .post("/api/tickets/bulk")
          .set("Authorization", `Basic ${btoa(authBase64)}`)
          .send(mockInputBody);

        expect(mockFindOne).toHaveBeenCalled();
        expect(mockCreate).toHaveBeenCalled();

        expect(statusCode).toBe(201);
        expect(body).toEqual([mockCreateTicketsValue]);
      });
    });

    describe("given an invalid input missing required truckId property", () => {
      it("should return 400 and error message", async () => {
        const authBase64 = `${config.get("user")}:${config.get("password")}`;
        const mockInputBody = {
          tickets: [{ dispatchedTime: "2024-01-05T04:00:00.010Z", siteId: 11 }],
        };
        const expectedErrorMsg = "truckId is required";

        const { statusCode, body } = await supertest(app)
          .post("/api/tickets/bulk")
          .set("Authorization", `Basic ${btoa(authBase64)}`)
          .send(mockInputBody);

        expect(statusCode).toBe(400);
        expect(body.msg).toEqual(expectedErrorMsg);
      });
    });
  });
});

import { readFileSync } from "fs";
import { Site, Truck, Ticket } from "../src/model.js";

seed();

async function seed() {
  try {
    await Site.sync({ force: true });
    await Truck.sync({ force: true });
    await Ticket.sync({ force: true });

    const sitesData = JSON.parse(readFileSync("scripts/SitesJSONData.json", "utf8"));
    const trucksData = JSON.parse(readFileSync("scripts/TrucksJSONData.json", "utf8"));

    await Site.bulkCreate(sitesData);
    await Truck.bulkCreate(trucksData);

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Failed seeding database", error);
  }
}

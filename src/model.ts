import { Sequelize, DataTypes, Model } from "sequelize";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite3",
  logging: false,
});

const Site = sequelize.define("Site", {
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

const Truck = sequelize.define("Truck", {
  license: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

const Ticket = sequelize.define(
  "Ticket",
  {
    ticketNumber: {
      type: DataTypes.INTEGER,
    },
    dispatchedTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    material: {
      type: DataTypes.ENUM("Soil"),
      allowNull: false,
      defaultValue: "Soil",
    },
  },
  {
    indexes: [{ unique: true, fields: ["siteId", "ticketNumber"] }],
  }
);

Ticket.beforeCreate(async (ticket, options) => {
  const preTicket = ticket as Model & { siteId: number; ticketNumber: number };
  const lastSiteTicket: any = await Ticket.findOne({
    where: { siteId: preTicket.siteId },
    order: [["ticketNumber", "DESC"]],
  });

  preTicket.ticketNumber = lastSiteTicket ? lastSiteTicket.ticketNumber + 1 : 1;
});

// One-to-many -> Site to Trucks
Site.hasMany(Truck, { foreignKey: "siteId" });
Truck.belongsTo(Site, { foreignKey: "siteId" });

// One-to-many -> Truck to tickets
Truck.hasMany(Ticket, { foreignKey: "truckId" });
Ticket.belongsTo(Truck, { foreignKey: "truckId" });

// One-to-many -> Site to tickets
Site.hasMany(Ticket, { foreignKey: "siteId" });
Ticket.belongsTo(Site, { foreignKey: "siteId" });

export { sequelize, Site, Truck, Ticket };

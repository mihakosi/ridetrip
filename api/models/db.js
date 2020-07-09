const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DATABASE}`,
  {
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

/* Models */
Offer = sequelize.import("./offers");
Reservation = sequelize.import("./reservations");
RouteReservation = sequelize.import("./routeReservations");
Route = sequelize.import("./routes");
User = sequelize.import("./users");
Vehicle = sequelize.import("./vehicles");

/* Relationships */
Offer.belongsTo(User, { as: "driver" });
Offer.belongsTo(Vehicle, { as: "vehicle" });
Offer.hasMany(Route, { as: "routes", foreignKey: "offerId" });

Reservation.belongsTo(User, { as: "user" });

Reservation.belongsToMany(Route, { through: RouteReservation });
Route.belongsToMany(Reservation, { through: RouteReservation });

Route.belongsTo(Offer, { as: "offer" });

User.hasMany(Offer, { as: "offers", foreignKey: "driverId" });
User.hasMany(Reservation, { as: "reservations", foreignKey: "userId" });
User.hasMany(Vehicle, { as: "vehicles", foreignKey: "ownerId" });

Vehicle.belongsTo(User, { as: "owner" });
Vehicle.hasMany(Offer, { as: "offers", foreignKey: "vehicleId" });

/* Set up extensions */
sequelize.query(`CREATE EXTENSION IF NOT EXISTS cube`).then(() => {
  sequelize.query(`CREATE EXTENSION IF NOT EXISTS earthdistance`).then(() => {
    /* Sync */
    sequelize
      .sync()
      .then(() => {
        console.log("Tables created.");
      })
      .catch((error) => {
        console.log(error);
      });
  });
});

module.exports = {
  sequelize,
  Offer,
  Reservation,
  RouteReservation,
  Route,
  User,
  Vehicle,
};

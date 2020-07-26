const Sequelize = require("sequelize");

const sequelize = new Sequelize(process.env.POSTGRES_CONNECTION_URL, {
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

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
Rating = sequelize.import("./ratings");
Recurring = sequelize.import("./recurring");
Reservation = sequelize.import("./reservations");
RouteReservation = sequelize.import("./routeReservations");
Route = sequelize.import("./routes");
User = sequelize.import("./users");
Vehicle = sequelize.import("./vehicles");

/* Relationships */
Offer.belongsTo(Recurring, { as: "recurring" });
Offer.hasMany(Route, { as: "routes", foreignKey: "offerId" });
Offer.belongsTo(User, { as: "driver" });
Offer.belongsTo(Vehicle, { as: "vehicle" });

Rating.belongsTo(User, { as: "user" });

Recurring.hasMany(Offer, { as: "offers", foreignKey: "recurringId", allowNull: true });
Recurring.belongsTo(User, { as: "user" });
Recurring.belongsTo(Vehicle, { as: "vehicle" });

Reservation.belongsTo(User, { as: "user" });

Route.belongsToMany(Reservation, { through: RouteReservation });
Reservation.belongsToMany(Route, { through: RouteReservation });

Route.belongsTo(Offer, { as: "offer" });

User.hasMany(Offer, { as: "offers", foreignKey: "driverId" });
User.hasMany(Rating, { as: "ratings", foreignKey: "userId" });
User.hasMany(Recurring, { as: "recurring", foreignKey: "userId" });
User.hasMany(Reservation, { as: "reservations", foreignKey: "userId" });
User.hasMany(Vehicle, { as: "vehicles", foreignKey: "ownerId" });

Vehicle.hasMany(Offer, { as: "offers", foreignKey: "vehicleId" });
Vehicle.hasMany(Recurring, { as: "recurring", foreignKey: "vehicleId", allowNull: true });
Vehicle.belongsTo(User, { as: "owner" });

let models = {
  Offer: Offer,
  Rating: Rating,
  Reservation: Reservation,
  RouteReservation: RouteReservation,
  Route: Route,
  User: User,
  Vehicle: Vehicle,
};

let syncOptions = {};
if (process.env.NODE_ENV === "development") {
  syncOptions.force = true;
} else {
  syncOptions.alter = true;
}

/* Set up extensions */
sequelize.query(`CREATE EXTENSION IF NOT EXISTS cube`).then(() => {
  sequelize.query(`CREATE EXTENSION IF NOT EXISTS earthdistance`).then(() => {
    /* Sync */
    sequelize
      .sync(syncOptions)
      .then(() => {
        console.log("Tables created.");

        if (process.env.NODE_ENV === "development") {
          fillDatabase(models)
            .then(() => {
              console.log("Test data inserted.");
            })
            .catch((error) => {
              console.log(error);
            });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });
});

/* Fill database with dummy data */
const fillDatabase = async (models) => {
  /* Users */
  await models.User.create({
    firstName: "Janez",
    lastName: "Horvat",
    email: "janez@horvat.com",
    phone: "041846394",
    password: "$2b$10$upH6WHm0Z9ZqdhBDytQsIOz6iNHZg00OJtwL9aB9T/EPeEX6.UgSq",
  });

  await models.User.create({
    firstName: "Jana",
    lastName: "Gal",
    email: "jana@gal.com",
    phone: "031567391",
    password: "$2b$10$pFdxVH80/ZmC/zODh1cp7ewYA1xhSec0EgfcHCQYNixN5WHSueUIG",
  });

  await models.User.create({
    firstName: "Lea",
    lastName: "Jiménez",
    email: "lea@jimenez.com",
    phone: "641732932",
    password: "$2b$10$bD/sRHZSFF5YFcHGz0vugucarWEZ0fQMw8aLqqKh6rRI9iWeGw70m",
  });

  await models.User.create({
    firstName: "Gregor",
    lastName: "Zupan",
    email: "gregor@zupan.com",
    phone: "030456330",
    password: "$2b$10$G8MxgwPWZcimkYtioVqmTOyoJAxiTpuL.J2LcU6EyiXANBVInKmnu",
  });

  /* Vehicles */
  await models.Vehicle.create({
    model: "Renault Clio",
    licencePlate: "MB DT 539",
    passengers: 4,
    baggage: 2,
    ownerId: 1,
  });

  await models.Vehicle.create({
    model: "Audi A3",
    licencePlate: "LJ CDN 85",
    passengers: 4,
    baggage: 3,
    ownerId: 2,
  });

  /* Offers */
  await models.Offer.create({
    passengers: 3,
    baggage: 2,
    description:
      "Prostor za eno osebo spredaj in dve zadaj. Prosim za zmerno količino prtljage po osebi. Odhod bo maksimalno 5 minut po določenem času, zato prosim, da ste točni.",
    active: true,
    driverId: 1,
    vehicleId: 1,
  });

  await models.Offer.create({
    passengers: 3,
    baggage: 2,
    description: "",
    active: false,
    cancellationReason: "Zaradi nujnih obveznosti moram iz Portoroža oditi nekaj dni prej. Opravičujem se za nevšečnosti.",
    driverId: 1,
    vehicleId: 1,
  });

  await models.Offer.create({
    passengers: 2,
    baggage: 2,
    description: "Prostor samo na zadnjih sedežih. Prevoz je praviloma brez postanka.",
    active: true,
    driverId: 2,
    vehicleId: 2,
  });

  /* Routes */
  await models.Route.create({
    start: "Avtobusna postaja Maribor, Mlinska ulica, Center, Maribor, 2000, Slovenija",
    startSimple: "Maribor",
    startLatitude: 46.5596386,
    startLongitude: 15.6554157,
    end: "Kristalna palača, 8, Ameriška ulica, BTC, Nove Jarše, Ljubljana, Upravna Enota Ljubljana, 1000, Slovenija",
    endSimple: "Ljubljana",
    endLatitude: 46.066573,
    endLongitude: 14.541559309498947,
    departure: new Date(0).setUTCSeconds(1595656800),
    price: 5,
    offerId: 1,
  });

  await models.Route.create({
    start: "Kristalna palača, 8, Ameriška ulica, BTC, Nove Jarše, Ljubljana, Upravna Enota Ljubljana, 1000, Slovenija",
    startSimple: "Ljubljana",
    startLatitude: 46.066573,
    startLongitude: 14.541559309498947,
    end: "Grand Hotel Portorož, 43, Obala, Fazan, Piran, Upravna enota Piran, 6320, Slovenija",
    endSimple: "Piran",
    endLatitude: 45.514533650000004,
    endLongitude: 13.590123,
    departure: new Date(0).setUTCSeconds(1595671200),
    price: 10,
    offerId: 1,
  });

  await models.Route.create({
    start: "Grand Hotel Portorož, 43, Obala, Fazan, Piran, Upravna enota Piran, 6320, Slovenija",
    startSimple: "Piran",
    startLatitude: 45.514533650000004,
    startLongitude: 13.590123,
    end: "Avtobusna postaja Maribor, Mlinska ulica, Center, Maribor, 2000, Slovenija",
    endSimple: "Maribor",
    endLatitude: 46.5596386,
    endLongitude: 15.6554157,
    departure: new Date(0).setUTCSeconds(1596276000),
    price: 15,
    offerId: 2,
  });

  await models.Route.create({
    start:
      "Avtobusna postaja Ljubljana, Trg Osvobodilne fronte, Zupančičeva jama, Bežigrad, Ljubljana, Upravna Enota Ljubljana, 1000, Slovenija",
    startSimple: "Ljubljana",
    startLatitude: 46.057711,
    startLongitude: 14.5095422,
    end: "Bernardin, Upravna enota Piran, 6330, Slovenija",
    endSimple: "Bernardin",
    endLatitude: 45.5153671,
    endLongitude: 13.571838,
    departure: new Date(0).setUTCSeconds(1595656800),
    price: 16,
    offerId: 3,
  });

  /* Reservations */
  await models.Reservation.create({
    passengers: 1,
    baggage: 1,
    active: true,
    userId: 3,
  });

  await models.Reservation.create({
    passengers: 1,
    baggage: 1,
    active: true,
    userId: 4,
  });

  await models.Reservation.create({
    passengers: 1,
    baggage: 1,
    active: true,
    userId: 4,
  });

  /* Route reservations */
  await models.RouteReservation.create({
    reservationId: 1,
    routeId: 2,
  });

  await models.RouteReservation.create({
    reservationId: 2,
    routeId: 1,
  });

  await models.RouteReservation.create({
    reservationId: 2,
    routeId: 2,
  });

  await models.RouteReservation.create({
    reservationId: 3,
    routeId: 3,
  });
};

module.exports = {
  sequelize,
  Offer,
  Rating,
  Recurring,
  Reservation,
  RouteReservation,
  Route,
  User,
  Vehicle,
};

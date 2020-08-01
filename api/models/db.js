const Sequelize = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
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
  Recurring: Recurring,
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

        if (process.env.NODE_ENV === "development" || process.env.USE_TEST_DATA === "true") {
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
  Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };

  let date = new Date();
  date.setDate(date.getDate() + ((1 + 7 - date.getDay()) % 7));

  let user = await models.User.findOne({
    where: {
      email: "janez.horvat@example.com",
    },
  });

  if (!user) {
    /* Users */
    await models.User.create({
      firstName: "Janez",
      lastName: "Horvat",
      email: "janez.horvat@example.com",
      phone: "041846394",
      password: "$2b$10$upH6WHm0Z9ZqdhBDytQsIOz6iNHZg00OJtwL9aB9T/EPeEX6.UgSq",
    });

    await models.User.create({
      firstName: "Jana",
      lastName: "Gal",
      email: "jana.gal@example.com",
      phone: "031567391",
      password: "$2b$10$pFdxVH80/ZmC/zODh1cp7ewYA1xhSec0EgfcHCQYNixN5WHSueUIG",
    });

    await models.User.create({
      firstName: "Lea",
      lastName: "Jiménez",
      email: "lea.jimenez@example.com",
      phone: "641732932",
      password: "$2b$10$bD/sRHZSFF5YFcHGz0vugucarWEZ0fQMw8aLqqKh6rRI9iWeGw70m",
    });

    await models.User.create({
      firstName: "Gregor",
      lastName: "Zupan",
      email: "gregor.zupan@example.com",
      phone: "030456330",
      password: "$2b$10$G8MxgwPWZcimkYtioVqmTOyoJAxiTpuL.J2LcU6EyiXANBVInKmnu",
    });

    await models.User.create({
      firstName: "Tjaša",
      lastName: "Belec",
      email: "tjasa.belec@example.com",
      phone: "030452654",
      password: "$2b$10$sgIj1OIeJ6dplhvY3ipRbOoHizl1pXJKlyE3yt0QNWWZAnVzGCFmm",
    });

    await models.User.create({
      firstName: "Matjaž",
      lastName: "Hartman",
      email: "matjaz.hartman@example.com",
      phone: "051632049",
      password: "$2b$10$uIMJoNSq7kwDwrYd9Br2wO/AYhyVmiNxGJwxMcAcqHtmY1GO0Ld5q",
    });

    await models.User.create({
      firstName: "Anamarija",
      lastName: "Nemec",
      email: "anamarija.nemec@example.com",
      phone: "050328320",
      password: "$2b$10$YGZX3P6YtnNf2WwRJqdBYeYPhIoRBJSYuYX2exkdUAHOmqgPvBcoK",
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

    await models.Vehicle.create({
      model: "Volkswagen Polo",
      licencePlate: "MS NT 180",
      passengers: 4,
      baggage: 2,
      ownerId: 5,
    });

    await models.Vehicle.create({
      model: "Ford Focus",
      licencePlate: "MS SA 342",
      passengers: 4,
      baggage: 3,
      ownerId: 5,
    });

    await models.Vehicle.create({
      model: "Peugeot 308",
      licencePlate: "KP DST 13",
      passengers: 4,
      baggage: 3,
      ownerId: 6,
    });

    /* Recurring */
    await models.Recurring.create({
      start: "Supernova 2, 4, Ankaranska cesta, Prisoje, Olmo, Koper, Upravna enota Koper, 6000, Slovenija",
      startSimple: "Koper",
      startLatitude: 45.541487399999994,
      startLongitude: 13.737743113385196,
      end:
        "Avtobusna postaja Ljubljana, Trg Osvobodilne fronte, Zupančičeva jama, Vodmat, Ljubljana, Upravna Enota Ljubljana, 1000, Slovenija",
      endSimple: "Ljubljana",
      endLatitude: 46.057711,
      endLongitude: 14.5095422,
      departure: "06:00:00",
      passengers: 3,
      baggage: 3,
      mondays: true,
      tuesdays: true,
      wednesdays: true,
      thursdays: true,
      fridays: true,
      saturdays: false,
      sundays: false,
      offered: true,
      price: 8,
      userId: 6,
      vehicleId: 5,
    });

    await models.Recurring.create({
      start:
        "Avtobusna postaja Ljubljana, Trg Osvobodilne fronte, Zupančičeva jama, Vodmat, Ljubljana, Upravna Enota Ljubljana, 1000, Slovenija",
      startSimple: "Ljubljana",
      startLatitude: 46.057711,
      startLongitude: 14.5095422,
      end: "Supernova 2, 4, Ankaranska cesta, Prisoje, Olmo, Koper, Upravna enota Koper, 6000, Slovenija",
      endSimple: "Koper",
      endLatitude: 45.541487399999994,
      endLongitude: 13.737743113385196,
      departure: "17:00:00",
      passengers: 3,
      baggage: 3,
      mondays: true,
      tuesdays: true,
      wednesdays: true,
      thursdays: true,
      fridays: true,
      saturdays: false,
      sundays: false,
      offered: true,
      price: 8,
      userId: 6,
      vehicleId: 5,
    });

    await models.Recurring.create({
      start: "Koper, Upravna enota Koper, Slovenija",
      startSimple: "Koper",
      startLatitude: 45.5479551,
      startLongitude: 13.7304909,
      end: "Ljubljana, Upravna Enota Ljubljana, Slovenija",
      endSimple: "Ljubljana",
      endLatitude: 46.0499803,
      endLongitude: 14.5068602,
      departure: "07:00:00",
      passengers: 1,
      baggage: 1,
      mondays: true,
      tuesdays: false,
      wednesdays: false,
      thursdays: false,
      fridays: false,
      saturdays: false,
      sundays: false,
      offered: false,
      userId: 7,
    });

    await models.Recurring.create({
      start: "Ljubljana, Upravna Enota Ljubljana, Slovenija",
      startSimple: "Ljubljana",
      startLatitude: 46.0499803,
      startLongitude: 14.5068602,
      end: "Koper, Upravna enota Koper, Slovenija",
      endSimple: "Koper",
      endLatitude: 45.5479551,
      endLongitude: 13.7304909,
      departure: "17:00:00",
      passengers: 1,
      baggage: 1,
      mondays: false,
      tuesdays: false,
      wednesdays: false,
      thursdays: false,
      fridays: true,
      saturdays: false,
      sundays: false,
      offered: false,
      userId: 7,
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

    await models.Offer.create({
      passengers: 3,
      baggage: 3,
      description: "",
      active: true,
      recurringId: 1,
      driverId: 6,
      vehicleId: 5,
    });

    await models.Offer.create({
      passengers: 3,
      baggage: 3,
      description: "",
      active: true,
      recurringId: 2,
      driverId: 6,
      vehicleId: 5,
    });

    await models.Offer.create({
      passengers: 2,
      baggage: 2,
      description: "",
      active: true,
      driverId: 5,
      vehicleId: 4,
    });

    await models.Offer.create({
      passengers: 2,
      baggage: 2,
      description: "",
      active: true,
      driverId: 5,
      vehicleId: 4,
    });

    await models.Offer.create({
      passengers: 3,
      baggage: 3,
      description: "",
      active: true,
      recurringId: 1,
      driverId: 6,
      vehicleId: 5,
    });

    await models.Offer.create({
      passengers: 3,
      baggage: 3,
      description: "",
      active: true,
      recurringId: 2,
      driverId: 6,
      vehicleId: 5,
    });

    await models.Offer.create({
      passengers: 3,
      baggage: 3,
      description: "",
      active: true,
      recurringId: 1,
      driverId: 6,
      vehicleId: 5,
    });

    await models.Offer.create({
      passengers: 3,
      baggage: 3,
      description: "",
      active: true,
      recurringId: 2,
      driverId: 6,
      vehicleId: 5,
    });

    await models.Offer.create({
      passengers: 3,
      baggage: 3,
      description: "",
      active: true,
      recurringId: 1,
      driverId: 6,
      vehicleId: 5,
    });

    await models.Offer.create({
      passengers: 3,
      baggage: 3,
      description: "",
      active: true,
      recurringId: 2,
      driverId: 6,
      vehicleId: 5,
    });

    await models.Offer.create({
      passengers: 2,
      baggage: 2,
      description: "",
      active: true,
      driverId: 5,
      vehicleId: 3,
    });

    await models.Offer.create({
      passengers: 2,
      baggage: 2,
      description: "",
      active: true,
      driverId: 2,
      vehicleId: 2,
    });

    await models.Offer.create({
      passengers: 2,
      baggage: 2,
      description: "",
      active: true,
      driverId: 2,
      vehicleId: 2,
    });

    await models.Offer.create({
      passengers: 2,
      baggage: 2,
      description: "",
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
      departure: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 10, 0, 0, 0),
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
      departure: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 15, 0, 0),
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
      departure: new Date(date.addDays(6).getFullYear(), date.addDays(6).getMonth(), date.addDays(6).getDate(), 12, 0, 0, 0),
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
      departure: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0),
      price: 16,
      offerId: 3,
    });

    await models.Route.create({
      start: "Supernova 2, 4, Ankaranska cesta, Prisoje, Olmo, Koper, Upravna enota Koper, 6000, Slovenija",
      startSimple: "Koper",
      startLatitude: 45.541487399999994,
      startLongitude: 13.737743113385196,
      end:
        "Avtobusna postaja Ljubljana, Trg Osvobodilne fronte, Zupančičeva jama, Vodmat, Ljubljana, Upravna Enota Ljubljana, 1000, Slovenija",
      endSimple: "Ljubljana",
      endLatitude: 46.057711,
      endLongitude: 14.5095422,
      departure: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 6, 0, 0, 0),
      price: 8,
      offerId: 4,
    });

    await models.Route.create({
      start:
        "Avtobusna postaja Ljubljana, Trg Osvobodilne fronte, Zupančičeva jama, Vodmat, Ljubljana, Upravna Enota Ljubljana, 1000, Slovenija",
      startSimple: "Ljubljana",
      startLatitude: 46.057711,
      startLongitude: 14.5095422,
      end: "Supernova 2, 4, Ankaranska cesta, Prisoje, Olmo, Koper, Upravna enota Koper, 6000, Slovenija",
      endSimple: "Koper",
      endLatitude: 45.541487399999994,
      endLongitude: 13.737743113385196,
      departure: new Date(date.addDays(1).getFullYear(), date.addDays(1).getMonth(), date.addDays(1).getDate(), 17, 0, 0, 0),
      price: 8,
      offerId: 5,
    });

    await models.Route.create({
      start: "TUŠ, 36, Prešernova ulica, Ljutomer, 9240, Slovenija",
      startSimple: "Ljutomer",
      startLatitude: 46.5236801,
      startLongitude: 16.19467034766427,
      end: "Avtobusna postaja Maribor, Mlinska ulica, Center, Maribor, 2000, Slovenija",
      endSimple: "Maribor",
      endLatitude: 46.5596386,
      endLongitude: 15.6554157,
      departure: new Date(date.addDays(3).getFullYear(), date.addDays(3).getMonth(), date.addDays(3).getDate(), 6, 0, 0, 0),
      price: 3,
      offerId: 6,
    });

    await models.Route.create({
      start: "Avtobusna postaja Maribor, Mlinska ulica, Center, Maribor, 2000, Slovenija",
      startSimple: "Maribor",
      startLatitude: 46.5596386,
      startLongitude: 15.6554157,
      end:
        "Nova KBM – Ljubljana Poslovanje s pravnimi osebami, 50, Dunajska cesta, Zupančičeva jama, Bežigrad, Ljubljana, Upravna Enota Ljubljana, 1000, Slovenija",
      endSimple: "Ljubljana",
      endLatitude: 46.0647094,
      endLongitude: 14.5092881,
      departure: new Date(date.addDays(3).getFullYear(), date.addDays(3).getMonth(), date.addDays(3).getDate(), 6, 45, 0, 0),
      price: 5,
      offerId: 6,
    });

    await models.Route.create({
      start:
        "Nova KBM – Ljubljana Poslovanje s pravnimi osebami, 50, Dunajska cesta, Zupančičeva jama, Bežigrad, Ljubljana, Upravna Enota Ljubljana, 1000, Slovenija",
      startSimple: "Ljubljana",
      startLatitude: 46.0647094,
      startLongitude: 14.5092881,
      end: "TUŠ, 36, Prešernova ulica, Ljutomer, 9240, Slovenija",
      endSimple: "Ljutomer",
      endLatitude: 46.5236801,
      endLongitude: 16.19467034766427,
      departure: new Date(date.addDays(4).getFullYear(), date.addDays(4).getMonth(), date.addDays(4).getDate(), 17, 0, 0, 0),
      price: 8,
      offerId: 7,
    });

    await models.Route.create({
      start: "Supernova 2, 4, Ankaranska cesta, Prisoje, Olmo, Koper, Upravna enota Koper, 6000, Slovenija",
      startSimple: "Koper",
      startLatitude: 45.541487399999994,
      startLongitude: 13.737743113385196,
      end:
        "Avtobusna postaja Ljubljana, Trg Osvobodilne fronte, Zupančičeva jama, Vodmat, Ljubljana, Upravna Enota Ljubljana, 1000, Slovenija",
      endSimple: "Ljubljana",
      endLatitude: 46.057711,
      endLongitude: 14.5095422,
      departure: new Date(date.addDays(2).getFullYear(), date.addDays(2).getMonth(), date.addDays(2).getDate(), 6, 0, 0, 0),
      price: 8,
      offerId: 8,
    });

    await models.Route.create({
      start:
        "Avtobusna postaja Ljubljana, Trg Osvobodilne fronte, Zupančičeva jama, Vodmat, Ljubljana, Upravna Enota Ljubljana, 1000, Slovenija",
      startSimple: "Ljubljana",
      startLatitude: 46.057711,
      startLongitude: 14.5095422,
      end: "Supernova 2, 4, Ankaranska cesta, Prisoje, Olmo, Koper, Upravna enota Koper, 6000, Slovenija",
      endSimple: "Koper",
      endLatitude: 45.541487399999994,
      endLongitude: 13.737743113385196,
      departure: new Date(date.addDays(2).getFullYear(), date.addDays(2).getMonth(), date.addDays(2).getDate(), 17, 0, 0, 0),
      price: 8,
      offerId: 9,
    });

    await models.Route.create({
      start: "Supernova 2, 4, Ankaranska cesta, Prisoje, Olmo, Koper, Upravna enota Koper, 6000, Slovenija",
      startSimple: "Koper",
      startLatitude: 45.541487399999994,
      startLongitude: 13.737743113385196,
      end:
        "Avtobusna postaja Ljubljana, Trg Osvobodilne fronte, Zupančičeva jama, Vodmat, Ljubljana, Upravna Enota Ljubljana, 1000, Slovenija",
      endSimple: "Ljubljana",
      endLatitude: 46.057711,
      endLongitude: 14.5095422,
      departure: new Date(date.addDays(3).getFullYear(), date.addDays(3).getMonth(), date.addDays(3).getDate(), 6, 0, 0, 0),
      price: 8,
      offerId: 10,
    });

    await models.Route.create({
      start:
        "Avtobusna postaja Ljubljana, Trg Osvobodilne fronte, Zupančičeva jama, Vodmat, Ljubljana, Upravna Enota Ljubljana, 1000, Slovenija",
      startSimple: "Ljubljana",
      startLatitude: 46.057711,
      startLongitude: 14.5095422,
      end: "Supernova 2, 4, Ankaranska cesta, Prisoje, Olmo, Koper, Upravna enota Koper, 6000, Slovenija",
      endSimple: "Koper",
      endLatitude: 45.541487399999994,
      endLongitude: 13.737743113385196,
      departure: new Date(date.addDays(3).getFullYear(), date.addDays(3).getMonth(), date.addDays(3).getDate(), 17, 0, 0, 0),
      price: 8,
      offerId: 11,
    });

    await models.Route.create({
      start: "Supernova 2, 4, Ankaranska cesta, Prisoje, Olmo, Koper, Upravna enota Koper, 6000, Slovenija",
      startSimple: "Koper",
      startLatitude: 45.541487399999994,
      startLongitude: 13.737743113385196,
      end:
        "Avtobusna postaja Ljubljana, Trg Osvobodilne fronte, Zupančičeva jama, Vodmat, Ljubljana, Upravna Enota Ljubljana, 1000, Slovenija",
      endSimple: "Ljubljana",
      endLatitude: 46.057711,
      endLongitude: 14.5095422,
      departure: new Date(date.addDays(4).getFullYear(), date.addDays(4).getMonth(), date.addDays(4).getDate(), 6, 0, 0, 0),
      price: 8,
      offerId: 12,
    });

    await models.Route.create({
      start:
        "Avtobusna postaja Ljubljana, Trg Osvobodilne fronte, Zupančičeva jama, Vodmat, Ljubljana, Upravna Enota Ljubljana, 1000, Slovenija",
      startSimple: "Ljubljana",
      startLatitude: 46.057711,
      startLongitude: 14.5095422,
      end: "Supernova 2, 4, Ankaranska cesta, Prisoje, Olmo, Koper, Upravna enota Koper, 6000, Slovenija",
      endSimple: "Koper",
      endLatitude: 45.541487399999994,
      endLongitude: 13.737743113385196,
      departure: new Date(date.addDays(4).getFullYear(), date.addDays(4).getMonth(), date.addDays(4).getDate(), 17, 0, 0, 0),
      price: 8,
      offerId: 13,
    });

    await models.Route.create({
      start: "Hotel Žusterna, Strma pot, Žusterna, Koper, Upravna enota Koper, 6000, Slovenija",
      startSimple: "Koper",
      startLatitude: 45.545959249999996,
      startLongitude: 13.70885130172292,
      end: "WTC, 156, Dunajska cesta, Bratovševa ploščad, Bežigrad, Ljubljana, Upravna Enota Ljubljana, 1000, Slovenija",
      endSimple: "Ljubljana",
      endLatitude: 46.0822494,
      endLongitude: 14.51384622450431,
      departure: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0),
      price: 8,
      offerId: 14,
    });

    await models.Route.create({
      start: "WTC, 156, Dunajska cesta, Bratovševa ploščad, Bežigrad, Ljubljana, Upravna Enota Ljubljana, 1000, Slovenija",
      startSimple: "Ljubljana",
      startLatitude: 46.0822494,
      startLongitude: 14.51384622450431,
      end: "Miklošičev trg, Ljutomer, 9240, Slovenija",
      endSimple: "Ljutomer",
      endLatitude: 46.5180387,
      endLongitude: 16.1949084,
      departure: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 14, 0, 0, 0),
      price: 8,
      offerId: 14,
    });

    await models.Route.create({
      start: "Bernardin, Upravna enota Piran, 6330, Slovenija",
      startSimple: "Bernardin",
      startLatitude: 45.5153671,
      startLongitude: 13.571838,
      end: "Železniška postaja Celje, Ulica XIV. divizije, Zagrad, Celje, 3000, Slovenija",
      endSimple: "Celje",
      endLatitude: 46.22847215,
      endLongitude: 15.267646242573893,
      departure: new Date(date.addDays(1).getFullYear(), date.addDays(1).getMonth(), date.addDays(1).getDate(), 10, 0, 0, 0),
      price: 10,
      offerId: 15,
    });

    await models.Route.create({
      start: "Železniška postaja Celje, Ulica XIV. divizije, Zagrad, Celje, 3000, Slovenija",
      startSimple: "Celje",
      startLatitude: 46.22847215,
      startLongitude: 15.267646242573893,
      end: "Avtobusna postaja Maribor, Mlinska ulica, Center, Maribor, 2000, Slovenija",
      endSimple: "Maribor",
      endLatitude: 46.5596386,
      endLongitude: 15.6554157,
      departure: new Date(date.addDays(1).getFullYear(), date.addDays(1).getMonth(), date.addDays(1).getDate(), 14, 30, 0, 0),
      price: 3,
      offerId: 15,
    });

    await models.Route.create({
      start: "Avtobusna postaja Maribor, Mlinska ulica, Center, Maribor, 2000, Slovenija",
      startSimple: "Maribor",
      startLatitude: 46.5596386,
      startLongitude: 15.6554157,
      end: "MERKUR Celje Hudinja, 162, Mariborska cesta, Slance, Celje, 3000, Slovenija",
      endSimple: "Celje",
      endLatitude: 46.24946715,
      endLongitude: 15.28178133654001,
      departure: new Date(date.addDays(2).getFullYear(), date.addDays(2).getMonth(), date.addDays(2).getDate(), 8, 0, 0, 0),
      price: 3,
      offerId: 16,
    });

    await models.Route.create({
      start: "MERKUR Celje Hudinja, 162, Mariborska cesta, Slance, Celje, 3000, Slovenija",
      startSimple: "Celje",
      startLatitude: 46.24946715,
      startLongitude: 15.28178133654001,
      end: "6, Šmarješka cesta, Mačkovec, Novo mesto, 8000, Slovenija",
      endSimple: "Novo mesto",
      endLatitude: 45.8238026,
      endLongitude: 15.188831,
      departure: new Date(date.addDays(2).getFullYear(), date.addDays(2).getMonth(), date.addDays(2).getDate(), 9, 0, 0, 0),
      price: 9,
      offerId: 16,
    });

    await models.Route.create({
      start: "6, Šmarješka cesta, Mačkovec, Novo mesto, 8000, Slovenija",
      startSimple: "Novo mesto",
      startLatitude: 45.8238026,
      startLongitude: 15.188831,
      end: "MERKUR Celje Hudinja, 162, Mariborska cesta, Slance, Celje, 3000, Slovenija",
      endSimple: "Celje",
      endLatitude: 46.24946715,
      endLongitude: 15.28178133654001,
      departure: new Date(date.addDays(2).getFullYear(), date.addDays(2).getMonth(), date.addDays(2).getDate(), 18, 0, 0, 0),
      price: 9,
      offerId: 17,
    });

    await models.Route.create({
      start: "MERKUR Celje Hudinja, 162, Mariborska cesta, Slance, Celje, 3000, Slovenija",
      startSimple: "Celje",
      startLatitude: 46.24946715,
      startLongitude: 15.28178133654001,
      end: "Trg ljudske pravice, Alsócsente, Lendava, 9220, Slovenija",
      endSimple: "Lendava",
      endLatitude: 46.5616904,
      endLongitude: 16.45269,
      departure: new Date(date.addDays(2).getFullYear(), date.addDays(2).getMonth(), date.addDays(2).getDate(), 21, 15, 0, 0),
      price: 6,
      offerId: 17,
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

    await models.Reservation.create({
      passengers: 1,
      baggage: 1,
      active: true,
      userId: 7,
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

    await models.RouteReservation.create({
      reservationId: 4,
      routeId: 5,
    });
  }
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

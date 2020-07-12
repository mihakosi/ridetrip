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

        if (process.env.NODE_ENV === "development") {
          fillDatabase()
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
const fillDatabase = async () => {
  /* Users */
  await sequelize.query(`INSERT INTO "users" ("id", "firstName", "lastName", "email", "password", "image")
    SELECT * FROM (
      SELECT
        1, 'Janez', 'Horvat', 'janez@horvat.com', '$2b$10$upH6WHm0Z9ZqdhBDytQsIOz6iNHZg00OJtwL9aB9T/EPeEX6.UgSq', null
      UNION
      SELECT
        2, 'Jana', 'Gal', 'jana@gal.com', '$2b$10$pFdxVH80/ZmC/zODh1cp7ewYA1xhSec0EgfcHCQYNixN5WHSueUIG', null
      UNION
      SELECT
        3, 'Lea', 'Jiménez', 'lea@jimenez.com', '$2b$10$bD/sRHZSFF5YFcHGz0vugucarWEZ0fQMw8aLqqKh6rRI9iWeGw70m', null
      UNION
      SELECT
        4, 'Gregor', 'Zupan', 'gregor@zupan.com', '$2b$10$G8MxgwPWZcimkYtioVqmTOyoJAxiTpuL.J2LcU6EyiXANBVInKmnu', null
    ) AS x
    WHERE NOT EXISTS (SELECT * FROM "users")`);

  /* Vehicles */
  await sequelize.query(`INSERT INTO "vehicles" ("id", "model", "licencePlate", "passengers", "baggage", "ownerId")
    SELECT * FROM (
      SELECT
        1, 'Renault Clio', 'MB DT 539', 4, 2, 1
      UNION
      SELECT
        2, 'Audi A3', 'LJ CDN 85', 4, 3, 2
    ) AS x
    WHERE NOT EXISTS (SELECT * FROM "vehicles")`);

  /* Offers */
  await sequelize.query(`INSERT INTO "offers" ("id", "passengers", "baggage", "description", "active", "cancellationReason", "driverId", "vehicleId")
    SELECT * FROM (
      SELECT
        1, 3, 2, 'Prostor za eno osebo spredaj in dve zadaj. Prosim za zmerno količino prtljage po osebi. Odhod bo maksimalno 5 minut po določenem času, zato prosim, da ste točni.', TRUE, NULL, 1, 1
      UNION
      SELECT
        2, 3, 2, '', FALSE, 'Zaradi nujnih obveznosti moram iz Portoroža oditi nekaj dni prej. Opravičujem se za nevšečnosti.', 1, 1
      UNION
      SELECT
        3, 2, 2, 'Prostor samo na zadnjih sedežih. Prevoz je praviloma brez postanka.', TRUE, NULL, 2, 2
    ) AS x
    WHERE NOT EXISTS (SELECT * FROM "offers")`);

  /* Routes */
  await sequelize.query(`INSERT INTO "routes" ("id", "start", "startSimple", "startLatitude", "startLongitude", "end", "endSimple", "endLatitude", "endLongitude", "departure", "price", "offerId")
    SELECT * FROM (
      SELECT
        1, 'Avtobusna postaja Maribor, Mlinska ulica, Center, Maribor, 2000, Slovenija', 'Maribor', 46.5596386, 15.6554157, 'Kristalna palača, 8, Ameriška ulica, BTC, Nove Jarše, Ljubljana, Upravna Enota Ljubljana, 1000, Slovenija', 'Ljubljana', 46.066573, 14.541559309498947, to_timestamp(1595656800), 5, 1
      UNION
      SELECT
        2, 'Kristalna palača, 8, Ameriška ulica, BTC, Nove Jarše, Ljubljana, Upravna Enota Ljubljana, 1000, Slovenija', 'Ljubljana', 46.066573, 14.541559309498947, 'Grand Hotel Portorož, 43, Obala, Fazan, Piran, Upravna enota Piran, 6320, Slovenija', 'Piran', 45.514533650000004, 13.590123, to_timestamp(1595671200), 10, 1
      UNION
      SELECT
        3, 'Grand Hotel Portorož, 43, Obala, Fazan, Piran, Upravna enota Piran, 6320, Slovenija', 'Piran', 45.514533650000004, 13.590123, 'Avtobusna postaja Maribor, Mlinska ulica, Center, Maribor, 2000, Slovenija', 'Maribor', 46.5596386, 15.6554157, to_timestamp(1596276000), 15, 2
      UNION
      SELECT
        4, 'Avtobusna postaja Ljubljana, Trg Osvobodilne fronte, Zupančičeva jama, Bežigrad, Ljubljana, Upravna Enota Ljubljana, 1000, Slovenija', 'Ljubljana', 46.057711, 14.5095422, 'Bernardin, Upravna enota Piran, 6330, Slovenija', 'Bernardin', 45.5153671, 13.571838, to_timestamp(1595656800), 16, 3
      ) AS x
    WHERE NOT EXISTS (SELECT * FROM "routes")`);

  /* Reservations */
  await sequelize.query(`INSERT INTO "reservations" ("id", "passengers", "baggage", "active", "cancellationReason", "userId")
    SELECT * FROM (
      SELECT
        1, 1, 1, TRUE, NULL, 3
      UNION
      SELECT
        2, 1, 1, TRUE, NULL, 4
      UNION
      SELECT
        3, 1, 1, TRUE, NULL, 4
    ) AS x
    WHERE NOT EXISTS (SELECT * FROM "reservations")`);

  /* RouteReservations */
  await sequelize.query(`INSERT INTO "routeReservations" ("reservationId", "routeId")
    SELECT * FROM (
      SELECT
        1, 2
      UNION
      SELECT
        2, 1
      UNION
      SELECT
        2, 2
      UNION
      SELECT
        3, 3
    ) AS x
    WHERE NOT EXISTS (SELECT * FROM "routeReservations")`);
};

module.exports = {
  sequelize,
  Offer,
  Reservation,
  RouteReservation,
  Route,
  User,
  Vehicle,
};

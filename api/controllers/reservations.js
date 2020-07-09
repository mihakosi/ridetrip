const Sequelize = require("sequelize");
const { sequelize, Offer, Reservation, RouteReservation, Route } = require("../models/db");

// Get all reservations
const getReservations = (req, res) => {
  let date = new Date();
  date.setHours(0, 0);

  let operation = Sequelize.Op.gte;
  let order = "ASC";
  if (req.query.past != null && req.query.past === "true") {
    operation = Sequelize.Op.lt;
    order = "DESC";
  }

  Reservation.findAll({
    attributes: ["id", "passengers", "baggage", "date", "active", "cancellationReason"],
    include: [
      {
        model: Route,
        as: "routes",
        attributes: [
          "id",
          "start",
          "startSimple",
          "startLatitude",
          "startLongitude",
          "end",
          "endSimple",
          "endLatitude",
          "endLongitude",
          "departure",
          "price",
        ],
        through: {
          model: RouteReservation,
          as: "routeReservations",
          attributes: [],
        },
        include: [
          {
            model: Offer,
            as: "offer",
            attributes: [],
            where: { active: true },
          },
        ],
        where: {
          departure: {
            [operation]: date,
          },
        },
      },
    ],
    where: { userId: req.payload.id },
    group: ["reservations.id", "routes.id", "routes->routeReservations.reservationId", "routes->routeReservations.routeId"],
    order: [["routes", "departure", order]],
  })
    .then((reservations) => {
      // Price needs to be calculated separately
      reservations.forEach((reservation) => {
        let i = reservations.indexOf(reservation);
        reservation = reservation.get({ plain: true });

        reservation.price = 0.0;
        reservation.routes.forEach((route) => {
          reservation.price += route.price;
        });

        reservations[i] = reservation;
      });

      return res.status(200).json(reservations);
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
      });
    });
};

// Get a reservation with the given ID
const getReservation = (req, res) => {
  let licencePlateStart = new Date().setHours(new Date().getHours() - 8);
  let licencePlateEnd = new Date().setHours(new Date().getHours() + 8);

  Reservation.findOne({
    attributes: ["id", "passengers", "baggage", "date", "active", "cancellationReason"],
    include: [
      {
        model: Route,
        as: "routes",
        attributes: [
          "id",
          "start",
          "startSimple",
          "startLatitude",
          "startLongitude",
          "end",
          "endSimple",
          "endLatitude",
          "endLongitude",
          "departure",
          "price",
        ],
        through: {
          model: RouteReservation,
          as: "routeReservations",
          attributes: [],
        },
        include: [
          {
            model: Offer,
            as: "offer",
            attributes: ["id"],
            include: [
              {
                model: Vehicle,
                as: "vehicle",
                attributes: [
                  "model",
                  [
                    sequelize.literal(
                      `CASE WHEN "routes"."departure" >= to_timestamp(${
                        licencePlateStart / 1000
                      }) AND "routes"."departure" <= to_timestamp(${
                        licencePlateEnd / 1000
                      }) AND "reservations"."active" = TRUE THEN "routes->offer->vehicle"."licencePlate" END`
                    ),
                    "licencePlate",
                  ],
                ],
              },
              {
                model: User,
                as: "driver",
                attributes: ["id", "firstName", "lastName", "image"],
              },
            ],
            where: { active: true },
          },
        ],
      },
    ],
    where: { id: req.params.id, userId: req.payload.id },
    group: [
      "reservations.id",
      "routes.id",
      "routes->offer.id",
      "routes->offer->vehicle.id",
      "routes->offer->driver.id",
      "routes->routeReservations.reservationId",
      "routes->routeReservations.routeId",
    ],
    order: [["routes", "departure", "ASC"]],
  })
    .then((reservation) => {
      if (reservation) {
        // Price needs to be calculated separately
        reservation = reservation.get({ plain: true });

        reservation.price = 0.0;
        reservation.routes.forEach((route) => {
          reservation.price += route.price;
        });

        return res.status(200).json(reservation);
      } else {
        return res.status(404).json({
          message: "Rezervacija s tem enoličnim identifikatorjem ne obstaja.",
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
      });
    });
};

// Create a new reservation
const createReservation = (req, res) => {
  if (!req.body.routes || req.body.routes.length == 0) {
    return res.status(400).json({
      message: "Izberi prevoz za rezervacijo.",
    });
  } else if (!req.body.passengers || req.body.passengers <= 0) {
    return res.status(400).json({
      message: "Izberi ustrezno število potnikov za prevoz.",
    });
  } else if (req.body.baggage < 0) {
    return res.status(400).json({
      message: "Vnešena količina prtljage ni veljavna.",
    });
  } else {
    if (req.body.baggage == null) {
      req.body.baggage = 0;
    }

    // Get available space for passengers and baggage for each route
    Route.findAll({
      attributes: [
        "id",
        [sequelize.literal("CAST(offer.passengers - COALESCE(SUM(reservations.passengers), 0) AS integer)"), "passengersSpace"],
        [sequelize.literal("CAST(offer.baggage - COALESCE(SUM(reservations.baggage), 0) AS integer)"), "baggageSpace"],
      ],
      include: [
        {
          model: Reservation,
          as: "reservations",
          through: {
            model: RouteReservation,
            as: "routeReservations",
            attributes: [],
          },
        },
        {
          model: Offer,
          as: "offer",
        },
      ],
      where: {
        id: req.body.routes,
      },
      group: ["routes.id", "offer.baggage", "offer.passengers", "offer.id", "reservations.id"],
    })
      .then((routes) => {
        // Check if there is enough space for all the passengers and baggage
        let notEnoughSpace = routes.some((route) => {
          route = route.get({ plain: true });
          return req.body.passengers > route.passengersSpace || req.body.baggage > route.baggageSpace;
        });

        if (!notEnoughSpace) {
          Reservation.create({
            userId: req.payload.id,
            passengers: req.body.passengers,
            baggage: req.body.baggage,
            active: true,
          })
            .then((reservation) => {
              reservation
                .setRoutes(req.body.routes)
                .then((reservationRoutes) => {
                  return res.status(201).json(reservation);
                })
                .catch((error) => {
                  return res.status(500).json({
                    message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
                  });
                });
            })
            .catch((error) => {
              return res.status(500).json({
                message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
              });
            });
        } else {
          return res.status(400).json({
            message: "V vozilu ni dovolj prostora za toliko oseb ali prtljage.",
          });
        }
      })
      .catch((error) => {
        return res.status(500).json({
          message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
        });
      });
  }
};

// Cancel a reservation with the given ID
const cancelReservation = (req, res) => {
  if (!req.body.cancellationReason) {
    return res.status(400).json({
      message: "Vnesi razlog za preklic rezervacije.",
    });
  } else {
    Reservation.findOne({ where: { id: req.params.id, userId: req.payload.id } })
      .then((reservation) => {
        if (reservation) {
          if (reservation.active) {
            reservation
              .update({
                active: false,
                cancellationReason: req.body.cancellationReason,
              })
              .then((vehicle) => {
                return res.status(200).json(vehicle);
              })
              .catch((error) => {
                return res.status(500).json({
                  message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
                });
              });
          } else {
            return res.status(400).json({
              message: "Rezervacija je že preklicana.",
            });
          }
        } else {
          return res.status(404).json({
            message: "Rezervacija s tem enoličnim identifikatorjem ne obstaja.",
          });
        }
      })
      .catch((error) => {
        return res.status(500).json({
          message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
        });
      });
  }
};

module.exports = {
  getReservations,
  getReservation,
  createReservation,
  cancelReservation,
};

const Sequelize = require("sequelize");
const { sequelize, Offer, Rating, Reservation, RouteReservation, Route } = require("../models/db");

// Get all reservations
const getReservations = (req, res) => {
  let date = new Date();
  date.setHours(0, 0);

  let operation = Sequelize.Op.gte;
  if (req.query.past != null && req.query.past === "true") {
    operation = Sequelize.Op.lt;
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
            attributes: ["active", "cancellationReason"],
          },
        ],
        where: {
          departure: {
            [operation]: date,
          },
        },
      },
    ],
    where: { userId: req.auth.id },
    group: [
      "reservations.id",
      "routes.id",
      "routes->routeReservations.reservationId",
      "routes->routeReservations.routeId",
      "routes->offer.id",
    ],
    order: [["routes", "departure", "ASC"]],
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
            attributes: ["id", "active", "cancellationReason"],
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
                attributes: ["id", "firstName", "lastName", "phone", "image"],
                include: [
                  {
                    model: Rating,
                    as: "ratings",
                    attributes: [[sequelize.literal(`COALESCE(AVG("routes->offer->driver->ratings"."rating"), 0)`), "averageRating"]],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    where: { id: req.params.id, userId: req.auth.id },
    group: [
      "reservations.id",
      "routes.id",
      "routes->offer.id",
      "routes->offer->vehicle.id",
      "routes->offer->driver.id",
      "routes->routeReservations.reservationId",
      "routes->routeReservations.routeId",
      "routes->offer->driver->ratings.id",
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
  } else if (!req.body.passengers || Math.floor(req.body.passengers) <= 0) {
    return res.status(400).json({
      message: "Izberi ustrezno število potnikov za prevoz.",
    });
  } else if (Math.floor(req.body.baggage) < 0) {
    return res.status(400).json({
      message: "Vnešena količina prtljage ni veljavna.",
    });
  } else {
    if (req.body.baggage == null) {
      req.body.baggage = 0;
    }

    // Get available space for passengers and baggage for each route
    Route.findAll({
      attributes: ["id"],
      include: [
        {
          model: Reservation,
          as: "reservations",
          attributes: ["passengers", "baggage", "active"],
          through: {
            model: RouteReservation,
            as: "routeReservations",
            attributes: [],
          },
        },
        {
          model: Offer,
          as: "offer",
          where: {
            active: true,
          },
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

          // Calculate space left for passengers and baggage
          route.passengersSpace = route.offer.passengers;
          route.baggageSpace = route.offer.baggage;

          route.reservations.forEach((reservation) => {
            if (reservation.active) {
              route.passengersSpace -= reservation.passengers;
              route.baggageSpace -= reservation.baggage;
            }
          });

          return req.body.passengers > route.passengersSpace || req.body.baggage > route.baggageSpace;
        });

        if (!notEnoughSpace) {
          Reservation.create({
            userId: req.auth.id,
            passengers: Math.floor(req.body.passengers),
            baggage: Math.floor(req.body.baggage),
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
    Reservation.findOne({
      include: [
        {
          model: Route,
          as: "routes",
          attributes: ["id", "departure"],
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
              where: {
                active: true,
              },
            },
          ],
        },
      ],
      where: {
        id: req.params.id,
        [Sequelize.Op.or]: [{ userId: req.auth.id }, { "$routes->offer.driverId$": req.auth.id }],
      },
    })
      .then((reservation) => {
        if (reservation) {
          if (reservation.active) {
            // Reservation can be cancelled at most 8 hours before the departure
            if ((reservation.get({ plain: true }).routes[0].departure - new Date()) / (60 * 60 * 1000) >= 8) {
              reservation
                .update({
                  active: false,
                  cancellationReason: req.body.cancellationReason,
                })
                .then((reservation) => {
                  return res.status(200).json(reservation);
                })
                .catch((error) => {
                  return res.status(500).json({
                    message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
                  });
                });
            } else {
              return res.status(400).json({
                message: "Rezervacijo je možno preklicati največ 8 ur pred odhodom.",
              });
            }
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

// Get latest reservation for the authorised user
const getLatestReservation = (req, res) => {
  let date = new Date();

  Reservation.findOne({
    attributes: ["id", "active"],
    include: [
      {
        model: Route,
        as: "routes",
        attributes: [
          "start",
          "startSimple",
          "startLatitude",
          "startLongitude",
          "end",
          "endSimple",
          "endLatitude",
          "endLongitude",
          "departure",
        ],
        through: {
          model: RouteReservation,
          as: "routeReservations",
          attributes: [],
        },
        where: {
          offerId: {
            [Sequelize.Op.in]: [
              sequelize.literal(
                `SELECT "offerId"
                  FROM "routes"
                  INNER JOIN "routeReservations" ON "routeReservations"."routeId" = "routes"."id"
                  INNER JOIN "reservations" ON "reservations"."id" = "routeReservations"."reservationId"
                  WHERE "reservations"."userId" = ${req.auth.id} AND "reservations"."active" = TRUE
                  GROUP BY "routes"."departure", "routes"."offerId"
                  HAVING MIN(EXTRACT(EPOCH FROM (to_timestamp(${date.getTime() / 1000}) - "routes"."departure"))) >= 0
                  ORDER BY MIN(EXTRACT(EPOCH FROM (to_timestamp(${date.getTime() / 1000}) - "routes"."departure")))
                  LIMIT 1`
              ),
            ],
          },
        },
      },
    ],
    where: { userId: req.auth.id, active: true },
    order: [["routes", "departure", "ASC"]],
  })
    .then((reservation) => {
      return res.status(200).json(reservation);
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
      });
    });
};

// Get driver's location for a reservation with the given ID
const getLocation = (req, res) => {
  Offer.findOne({
    attributes: ["latitude", "longitude"],
    include: {
      model: Route,
      as: "routes",
      attributes: [],
      include: {
        model: Reservation,
        as: "reservations",
        attributes: [],
        through: {
          model: RouteReservation,
          as: "routeReservations",
          attributes: [],
        },
        where: {
          id: req.params.id,
          userId: req.auth.id,
        },
      },
    },
  })
    .then((location) => {
      if (location) {
        return res.status(200).json(location);
      } else {
        return res.status(404).json({
          message: "Podatki o lokaciji voznika niso na voljo.",
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
      });
    });
};

// Update passenger's location for a reservation with the given ID
const shareLocation = (req, res) => {
  if (!req.body.latitude || !req.body.longitude) {
    return res.status(400).json({
      message: "Napaka pri razpoznavanju lokacije.",
    });
  } else {
    Reservation.findOne({
      include: {
        model: Route,
        as: "routes",
        attributes: ["id", "departure"],
        through: {
          model: RouteReservation,
          as: "routeReservations",
          attributes: [],
        },
      },
      where: { id: req.params.id, userId: req.auth.id },
    })
      .then((reservation) => {
        if (reservation) {
          if (reservation.active) {
            // Location can be shared at most 1 hour before and after the departure from any location on route of the reservation
            let valid = reservation.get({ plain: true }).routes.some((route) => {
              return Math.abs(route.departure - new Date()) / (60 * 60 * 1000) < 1;
            });

            if (valid) {
              reservation
                .update({
                  latitude: req.body.latitude,
                  longitude: req.body.longitude,
                })
                .then((reservation) => {
                  return res.status(200).json(reservation);
                })
                .catch((error) => {
                  return res.status(500).json({
                    message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
                  });
                });
            } else {
              return res.status(400).json({
                message: "Lokacijo lahko deliš največ 1 uro pred oziroma po odhodu.",
              });
            }
          } else {
            return res.status(400).json({
              message: "Rezervacija je preklican.",
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

// Get driver for a reservation with the given ID
const getDriver = (req, res) => {
  Offer.findOne({
    attributes: ["id"],
    include: [
      {
        model: Route,
        as: "routes",
        attributes: [],
        include: {
          model: Reservation,
          as: "reservations",
          attributes: [],
          through: {
            model: RouteReservation,
            as: "routeReservations",
            attributes: [],
          },
          where: {
            id: req.params.id,
            userId: req.auth.id,
            [Sequelize.Op.or]: [{ passengerRated: false }, { passengerRated: null }],
          },
        },
      },
      {
        model: User,
        as: "driver",
        attributes: ["firstName", "lastName", "image"],
      },
    ],
  })
    .then((driver) => {
      return res.status(200).json(driver);
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
      });
    });
};

module.exports = {
  getReservations,
  getReservation,
  createReservation,
  cancelReservation,
  getLatestReservation,
  getLocation,
  shareLocation,
  getDriver,
};

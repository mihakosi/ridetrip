const Sequelize = require("sequelize");
const { sequelize, Offer, Reservation, RouteReservation, Route, Vehicle, User } = require("../models/db");

// Get all offers for the authorised user
const getOffers = (req, res) => {
  let date = new Date();
  date.setHours(0, 0);

  let operation = Sequelize.Op.gte;
  if (req.query.past != null && req.query.past === "true") {
    operation = Sequelize.Op.lt;
  }

  Offer.findAll({
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
        where: {
          departure: {
            [operation]: date,
          },
        },
      },
    ],
    where: { driverId: req.auth.id },
    order: [["routes", "departure", "ASC"]],
  })
    .then((offers) => {
      return res.status(200).json(offers);
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
      });
    });
};

// Get an offer with the given ID
const getOffer = (req, res) => {
  Offer.findOne({
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
        include: [
          {
            model: Reservation,
            as: "reservations",
            through: {
              model: RouteReservation,
              as: "routeReservations",
              attributes: [],
            },
            include: [
              {
                model: User,
                as: "user",
                attributes: ["id", "firstName", "lastName", "phone", "image"],
                include: {
                  model: Rating,
                  as: "ratings",
                  attributes: [[sequelize.literal(`COALESCE(AVG("routes->reservations->user->ratings"."rating"), 0)`), "averageRating"]],
                },
              },
            ],
          },
        ],
      },
      {
        model: Vehicle,
        as: "vehicle",
        attributes: ["id", "model", "licencePlate"],
      },
    ],
    where: { id: req.params.id, driverId: req.auth.id },
    order: [["routes", "departure", "ASC"]],
    group: [
      "offers.id",
      "routes.id",
      "routes->reservations.id",
      "routes->reservations->user.id",
      "vehicle.id",
      "routes->reservations->user->ratings.id",
    ],
  })
    .then((offer) => {
      if (offer) {
        offer = offer.get({ plain: true });

        // Calculate space left for passengers and baggage
        offer.routes.forEach((route) => {
          route.passengersSpace = offer.passengers;
          route.baggageSpace = offer.baggage;

          route.reservations.forEach((reservation) => {
            if (reservation.active) {
              route.passengersSpace -= reservation.passengers;
              route.baggageSpace -= reservation.baggage;
            }
          });
        });

        return res.status(200).json(offer);
      } else {
        return res.status(404).json({
          message: "Ponujen prevoz s tem enoličnim identifikatorjem ne obstaja.",
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
      });
    });
};

// Create a new offer
const createOffer = (req, res) => {
  if (!req.body.routes) {
    return res.status(400).json({
      message: "Prosimo, izberi začetno in končno lokacijo.",
    });
  } else if (req.body.routes.length > 2) {
    return res.status(400).json({
      message: "Dodaš lahko največ en postanek.",
    });
  } else if (!req.body.passengers || Math.floor(req.body.passengers) <= 0) {
    return res.status(400).json({
      message: "Na voljo mora biti prostor za vsaj enega potnika.",
    });
  } else if (Math.floor(req.body.baggage) < 0) {
    return res.status(400).json({
      message: "Vnešen prostor za prtljago ni veljaven.",
    });
  } else if (
    req.body.routes.some((route) => {
      return (
        !route.start ||
        !route.startSimple ||
        !route.startLatitude ||
        !route.startLongitude ||
        !route.end ||
        !route.endSimple ||
        !route.endLatitude ||
        !route.endLongitude ||
        !route.departure ||
        !route.price < 0
      );
    })
  ) {
    return res.status(400).json({
      message: "Prosimo, ustrezno izpolni vsa polja.",
    });
  } else {
    if (req.body.baggage == null) {
      req.body.baggage = 0;
    }

    if (req.body.recurring) {
      Recurring.findOne({ where: { id: req.body.recurring, userId: req.auth.id, offered: true } })
        .then((recurring) => {
          if (recurring) {
            continueCreateOffer(req, res);
          } else {
            return res.status(404).json({
              message: "Ponavljajoči prevoz s tem enoličnim identifikatorjem ne obstaja.",
            });
          }
        })
        .catch((error) => {
          return res.status(500).json({
            message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
          });
        });
    } else {
      continueCreateOffer(req, res);
    }
  }
};

const continueCreateOffer = (req, res) => {
  Vehicle.findOne({ where: { id: req.body.vehicle, ownerId: req.auth.id } })
    .then((vehicle) => {
      if (vehicle) {
        if (vehicle.passengers >= req.body.passengers && vehicle.baggage >= req.body.baggage) {
          Offer.create({
            driverId: req.auth.id,
            recurringId: req.body.recurring,
            vehicleId: req.body.vehicle,
            passengers: Math.floor(req.body.passengers),
            baggage: Math.floor(req.body.baggage),
            description: req.body.description,
            active: true,
            latitude: null,
            longitude: null,
          })
            .then((offer) => {
              req.body.routes.forEach((element) => {
                element["offerId"] = offer.id;
              });

              Route.bulkCreate(req.body.routes, { returning: true })
                .then((routes) => {
                  return res.status(201).json(offer);
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
      } else {
        return res.status(404).json({
          message: "Vozilo s tem enoličnim identifikatorjem ne obstaja.",
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
      });
    });
};

// Cancel an offer with the given ID
const cancelOffer = (req, res) => {
  if (!req.body.cancellationReason) {
    return res.status(400).json({
      message: "Vnesi razlog za preklic prevoza.",
    });
  } else {
    Offer.findOne({
      include: {
        model: Route,
        as: "routes",
        attributes: ["id", "departure"],
      },
      where: { id: req.params.id, driverId: req.auth.id },
      order: [["routes", "departure", "ASC"]],
    })
      .then((offer) => {
        if (offer) {
          if (offer.active) {
            let departure = offer.get({ plain: true }).routes[0].departure;

            // Offer can be cancelled at most 8 hours before the departure from the start
            if ((departure - new Date()) / (60 * 60 * 1000) >= 8) {
              offer
                .update({
                  active: false,
                  cancellationReason: req.body.cancellationReason,
                })
                .then((offer) => {
                  return res.status(200).json(offer);
                })
                .catch((error) => {
                  return res.status(500).json({
                    message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
                  });
                });
            } else {
              return res.status(400).json({
                message: "Prevoz je možno preklicati največ 8 ur pred odhodom.",
              });
            }
          } else {
            return res.status(400).json({
              message: "Ponujen prevoz je že preklican.",
            });
          }
        } else {
          return res.status(404).json({
            message: "Ponujen prevoz s tem enoličnim identifikatorjem ne obstaja.",
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

// Get latest offer for the authorised user
const getLatestOffer = (req, res) => {
  let date = new Date();

  Offer.findOne({
    attributes: ["id", "active"],
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
        where: {
          offerId: {
            [Sequelize.Op.in]: [
              sequelize.literal(
                `SELECT "offerId"
                  FROM "routes"
                  INNER JOIN "offers" ON "offers"."id" = "routes"."offerId"
                  WHERE "offers"."driverId" = ${req.auth.id} AND "offers"."active" = TRUE
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
    where: { driverId: req.auth.id, active: true },
    order: [["routes", "departure", "ASC"]],
  })
    .then((offer) => {
      return res.status(200).json(offer);
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
      });
    });
};

// Get passengers' locations for an offer with the given ID
const getLocation = (req, res) => {
  Reservation.findAll({
    attributes: ["id", "latitude", "longitude"],
    include: {
      model: Route,
      as: "routes",
      attributes: [],
      through: {
        model: RouteReservation,
        as: "routeReservations",
        attributes: [],
      },
      include: {
        model: Offer,
        as: "offer",
        attributes: [],
      },
    },
    where: {
      "$routes->offer.id$": req.params.id,
      "$routes->offer.driverId$": req.auth.id,
    },
  })
    .then((locations) => {
      if (locations) {
        return res.status(200).json(locations);
      } else {
        return res.status(404).json({
          message: "Podatki o lokacijah potnikov niso na voljo.",
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
      });
    });
};

// Update driver's location for an offer with the given ID
const shareLocation = (req, res) => {
  if (!req.body.latitude || !req.body.longitude) {
    return res.status(400).json({
      message: "Napaka pri razpoznavanju lokacije.",
    });
  } else {
    Offer.findOne({
      include: {
        model: Route,
        as: "routes",
        attributes: ["id", "departure"],
      },
      where: { id: req.params.id, driverId: req.auth.id },
    })
      .then((offer) => {
        if (offer) {
          if (offer.active) {
            // Location can be shared at most 1 hour before and after the departure from any location on route
            let valid = offer.get({ plain: true }).routes.some((route) => {
              return Math.abs(route.departure - new Date()) / (60 * 60 * 1000) < 1;
            });

            if (valid) {
              offer
                .update({
                  latitude: req.body.latitude,
                  longitude: req.body.longitude,
                })
                .then((offer) => {
                  return res.status(200).json(offer);
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
              message: "Ponujen prevoz je preklican.",
            });
          }
        } else {
          return res.status(404).json({
            message: "Ponujen prevoz s tem enoličnim identifikatorjem ne obstaja.",
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

// Get all passengers for an offer with the given ID
const getPassengers = (req, res) => {
  Reservation.findAll({
    attributes: ["id"],
    include: [
      {
        model: Route,
        as: "routes",
        attributes: [],
        through: {
          model: RouteReservation,
          as: "routeReservations",
          attributes: [],
        },
        include: {
          model: Offer,
          as: "offer",
          attributes: [],
        },
      },
      {
        model: User,
        as: "user",
        attributes: ["firstName", "lastName", "image"],
      },
    ],
    where: {
      "$routes->offer.id$": req.params.id,
      "$routes->offer.driverId$": req.auth.id,
      [Sequelize.Op.or]: [{ driverRated: false }, { driverRated: null }],
    },
  })
    .then((passengers) => {
      if (passengers) {
        return res.status(200).json(passengers);
      } else {
        return res.status(404).json({
          message: "Seznam potnikov ni na voljo.",
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
      });
    });
};

module.exports = {
  getOffers,
  getOffer,
  createOffer,
  cancelOffer,
  getLatestOffer,
  getLocation,
  shareLocation,
  getPassengers,
};

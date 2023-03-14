const Sequelize = require("sequelize");
const { sequelize, Offer, Reservation, RouteReservation, Route, User, Vehicle } = require("../models/db");

const getRides = (req, res) => {
  if (!req.query.startLatitude || !req.query.startLongitude) {
    return res.status(400).json({
      message: "Prosimo, izberi začetno lokacijo.",
    });
  } else if (!req.query.endLatitude || !req.query.endLongitude) {
    return res.status(400).json({
      message: "Prosimo, izberi končno lokacijo.",
    });
  } else if (!req.query.date) {
    return res.status(400).json({
      message: "Prosimo, izberi datum prevoza.",
    });
  } else if (!req.query.passengers || req.query.passengers <= 0) {
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

    let date = new Date(new Date(req.query.date).setHours(0, 0, 0, 0));
    let tomorrow = new Date(new Date(req.query.date).setHours(0, 0, 0, 0));
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get offers that have stops located within 18 miles of provided start and end location
    Offer.findAll({
      attributes: ["id", "passengers", "baggage"],
      include: [
        {
          model: Route,
          as: "routes",
          attributes: [
            "id",
            "startSimple",
            "endSimple",
            "price",
            "departure",
            [
              sequelize.literal(
                `point(${req.query.startLongitude}, ${req.query.startLatitude}) <@> point("routes"."startLongitude", "routes"."startLatitude")::point`
              ),
              "startDistance",
            ],
            [
              sequelize.literal(
                `point(${req.query.endLongitude}, ${req.query.endLatitude}) <@> point("routes"."endLongitude", "routes"."endLatitude")::point`
              ),
              "endDistance",
            ],
          ],
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
          ],
          where: {
            departure: {
              [Sequelize.Op.between]: [date, tomorrow],
            },
          },
          having: {
            [Sequelize.Op.and]: [
              {
                startDistance: {
                  [Sequelize.Op.lt]: 18,
                },
              },
              {
                endDistance: {
                  [Sequelize.Op.lt]: 18,
                },
              },
            ],
          },
        },
      ],
      where: {
        active: true,
      },
      group: ["offers.id", "routes.id", "routes->reservations.id"],
      order: [["routes", "departure", "ASC"]],
    })
      .then((rides) => {
        let availableRides = [];

        // Eliminate rides that are full on any route between start and end location
        // Total price is also calculated manually
        rides.forEach((ride) => {
          ride = ride.get({ plain: true });

          // Calculate space left for passengers and baggage
          ride.routes.forEach((route) => {
            route.passengersSpace = ride.passengers;
            route.baggageSpace = ride.baggage;

            route.reservations.forEach((reservation) => {
              if (reservation.active) {
                route.passengersSpace -= reservation.passengers;
                route.baggageSpace -= reservation.baggage;
              }
            });
          });

          let start = ride.routes[0].id;
          let end = ride.routes[ride.routes.length - 1].id;

          let price = 0.0;

          let routes = [];
          let notEnoughSpace = false;

          let minStartDistance = -1;
          let minEndDistance = -1;

          ride.routes.forEach((route) => {
            // Determine start and end location of the offer based on minimum distance from given start and end location
            if (route.startDistance < minStartDistance || minStartDistance == -1) {
              start = route.id;
              minStartDistance = route.startDistance;
            }
            if (route.endDistance < minEndDistance || minEndDistance == -1) {
              end = route.id;
              minEndDistance = route.endDistance;
            }
          });

          ride.routes.forEach((route) => {
            if (route.id >= start && route.id <= end) {
              if (req.query.passengers > route.passengersSpace || req.query.baggage > route.baggageSpace) {
                notEnoughSpace = true;
              } else {
                routes.push(route);
                price += route.price;
              }
            }
          });

          ride.routes = routes;
          ride.price = price;

          if (!notEnoughSpace && minStartDistance < 18 && minEndDistance < 18) {
            availableRides.push(ride);
          }
        });

        return res.status(200).json(availableRides);
      })
      .catch((error) => {
        return res.status(500).json({
          message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
        });
      });
  }
};

// Get a ride with the given ID
const getRide = (req, res) => {
  if (!req.query.startLatitude || !req.query.startLongitude) {
    return res.status(400).json({
      message: "Prosimo, izberi začetno lokacijo.",
    });
  } else if (!req.query.endLatitude || !req.query.endLongitude) {
    return res.status(400).json({
      message: "Prosimo, izberi končno lokacijo.",
    });
  } else if (!req.query.passengers || req.query.passengers <= 0) {
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

    Offer.findOne({
      attributes: ["id", "description", "passengers", "baggage"],
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
            "price",
            "departure",
            [
              sequelize.literal(
                `point(${req.query.startLongitude}, ${req.query.startLatitude}) <@> point("routes"."startLongitude", "routes"."startLatitude")::point`
              ),
              "startDistance",
            ],
            [
              sequelize.literal(
                `point(${req.query.endLongitude}, ${req.query.endLatitude}) <@> point("routes"."endLongitude", "routes"."endLatitude")::point`
              ),
              "endDistance",
            ],
          ],
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
          ],
        },
        {
          model: User,
          as: "driver",
          attributes: ["id", "firstName", "lastName", "image"],
        },
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["model"],
        },
      ],
      where: { id: req.params.id, active: true },
      group: ["offers.id", "routes.id", "routes->reservations.id", "driver.id", "vehicle.id"],
      order: [["routes", "departure", "ASC"]],
    })
      .then((ride) => {
        if (ride) {
          ride = ride.get({ plain: true });

          // Calculate space left for passengers and baggage
          let routes = [];

          ride.routes.forEach((route) => {
            route.passengersSpace = ride.passengers;
            route.baggageSpace = ride.baggage;

            route.reservations.forEach((reservation) => {
              if (reservation.active) {
                route.passengersSpace -= reservation.passengers;
                route.baggageSpace -= reservation.baggage;
              }
            });

            routes.push(route);
          });

          ride.routes = routes;

          // Check if the ride is full on any route between start and end location
          // Total price is also calculated manually
          ride.price = 0.0;
          ride.passengersSpace = -1;
          ride.baggageSpace = -1;

          let start = ride.routes[0].id;
          let end = ride.routes[ride.routes.length - 1].id;

          routes = [];
          let notEnoughSpace = false;

          let minStartDistance = -1;
          let minEndDistance = -1;

          ride.routes.forEach((route) => {
            // Determine start and end location of the offer based on minimum distance from given start and end location
            if (route.startDistance < minStartDistance || minStartDistance == -1) {
              start = route.id;
              minStartDistance = route.startDistance;
            }
            if (route.endDistance < minEndDistance || minEndDistance == -1) {
              end = route.id;
              minEndDistance = route.endDistance;
            }
          });

          ride.routes.forEach((route) => {
            if (route.id >= start && route.id <= end) {
              if (req.query.passengers > route.passengersSpace || req.query.baggage > route.baggageSpace) {
                notEnoughSpace = true;
              } else {
                if (ride.passengersSpace > route.passengersSpace || ride.passengersSpace == -1) {
                  ride.passengersSpace = route.passengersSpace;
                }
                if (ride.baggageSpace > route.baggageSpace || ride.baggageSpace == -1) {
                  ride.baggageSpace = route.baggageSpace;
                }
                routes.push(route);
                ride.price += route.price;
              }
            }
          });

          ride.routes = routes;

          if (!notEnoughSpace) {
            return res.status(200).json(ride);
          } else {
            return res.status(400).json({
              message: "V vozilu ni dovolj prostora za toliko oseb ali prtljage.",
            });
          }
        } else {
          return res.status(404).json({
            message: "Prevoz s tem enoličnim identifikatorjem ne obstaja.",
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
  getRides,
  getRide,
};

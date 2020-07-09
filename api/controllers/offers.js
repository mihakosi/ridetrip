const Sequelize = require("sequelize");
const { sequelize, Offer, Reservation, RouteReservation, Route, Vehicle, User } = require("../models/db");

// Get all offers for the authorised user
const getOffers = (req, res) => {
  let date = new Date();
  date.setHours(0, 0);

  let operation = Sequelize.Op.gte;
  let order = "ASC";
  if (req.query.past != null && req.query.past === "true") {
    operation = Sequelize.Op.lt;
    order = "DESC";
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
    where: { driverId: req.payload.id },
    order: [["routes", "departure", order]],
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
          [
            sequelize.literal(
              `CAST("offers"."passengers" - COALESCE(SUM(CASE WHEN "routes->reservations"."active" = TRUE THEN "routes->reservations"."passengers" END), 0) AS integer)`
            ),
            "passengersSpace",
          ],
          [
            sequelize.literal(
              `CAST("offers"."baggage" - COALESCE(SUM(CASE WHEN "routes->reservations"."active" = TRUE THEN "routes->reservations"."baggage" END), 0) AS integer)`
            ),
            "baggageSpace",
          ],
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
            include: [{ model: User, as: "user", attributes: ["id", "firstName", "lastName", "image"] }],
          },
        ],
      },
      {
        model: Vehicle,
        as: "vehicle",
        attributes: ["id", "model", "licencePlate"],
      },
    ],
    where: { id: req.params.id, driverId: req.payload.id },
    order: [["routes", "departure", "ASC"]],
    group: ["offers.id", "routes.id", "routes->reservations.id", "routes->reservations->user.id", "vehicle.id"],
  })
    .then((offer) => {
      if (offer) {
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
  } else if (!req.body.passengers || req.body.passengers <= 0) {
    return res.status(400).json({
      message: "Na voljo mora biti prostor za vsaj enega potnika.",
    });
  } else if (req.body.baggage < 0) {
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

    Vehicle.findOne({ where: { id: req.body.vehicle, ownerId: req.payload.id } })
      .then((vehicle) => {
        if (vehicle) {
          if (vehicle.passengers >= req.body.passengers && vehicle.baggage >= req.body.baggage) {
            Offer.create({
              driverId: req.payload.id,
              vehicleId: req.body.vehicle,
              passengers: req.body.passengers,
              baggage: req.body.baggage,
              description: req.body.description,
              active: true,
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
  }
};

module.exports = {
  getOffers,
  getOffer,
  createOffer,
};

const Sequelize = require("sequelize");
const { sequelize, Offer, Rating, Reservation, RouteReservation, Route, Vehicle, User } = require("../models/db");

// Create a new rating
const createRating = (req, res) => {
  if (!req.body.rating || Math.floor(req.body.rating) < 1 || Math.floor(req.body.rating) > 3) {
    return res.status(400).json({
      message: "Ocena mora biti med 1 in 3.",
    });
  } else if (!req.body.reservation) {
    return res.status(400).json({
      message: "Prosimo, izberi rezervacijo.",
    });
  } else {
    if (req.body.role == 0) {
      // Driver rates the passenger
      Reservation.findOne({
        attributes: ["id", "userId", "driverRated"],
        include: {
          model: Route,
          as: "routes",
          attributes: ["departure"],
          through: {
            model: RouteReservation,
            as: "routeReservations",
            attributes: [],
          },
          include: {
            model: Offer,
            as: "offer",
            attributes: [],
            where: {
              driverId: req.auth.id,
            },
          },
        },
        where: {
          id: req.body.reservation,
        },
        order: [["routes", "departure", "DESC"]],
      })
        .then((reservation) => {
          if (reservation) {
            if (!reservation.driverRated) {
              let departure = reservation.get({ plain: true }).routes[0].departure;

              // Rating can be created 24 hours after the departure from the last stop
              if ((new Date() - departure) / (60 * 60 * 1000) >= 24) {
                Rating.create({
                  role: req.body.role,
                  rating: Math.floor(req.body.rating),
                  userId: reservation.userId,
                })
                  .then((rating) => {
                    reservation
                      .update({
                        driverRated: true,
                      })
                      .then((reservation) => {
                        return res.status(200).json(rating);
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
                  message: "Oceno lahko oddaš 24 ur po odhodu z zadnjega postanka.",
                });
              }
            } else {
              return res.status(400).json({
                message: "Potnika/co si že ocenil/a.",
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
    } else if (req.body.role == 1) {
      // Passenger rates the driver
      Reservation.findOne({
        attributes: ["id", "passengerRated"],
        include: {
          model: Route,
          as: "routes",
          attributes: ["departure"],
          through: {
            model: RouteReservation,
            as: "routeReservations",
            attributes: [],
          },
          include: {
            model: Offer,
            as: "offer",
            attributes: ["driverId"],
          },
        },
        where: {
          id: req.body.reservation,
          userId: req.auth.id,
        },
        order: [["routes", "departure", "DESC"]],
      })
        .then((reservation) => {
          if (reservation) {
            if (!reservation.driverRated) {
              let departure = reservation.get({ plain: true }).routes[0].departure;

              // Rating can be created 24 hours after the departure from the last stop
              if ((new Date() - departure) / (60 * 60 * 1000) >= 24) {
                Rating.create({
                  role: req.body.role,
                  rating: Math.floor(req.body.rating),
                  userId: reservation.get({ plain: true }).routes[0].offer.driverId,
                })
                  .then((rating) => {
                    reservation
                      .update({
                        passengerRated: true,
                      })
                      .then((reservation) => {
                        return res.status(200).json(rating);
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
                  message: "Oceno lahko oddaš 24 ur po odhodu z zadnjega postanka.",
                });
              }
            } else {
              return res.status(400).json({
                message: "Voznika/co si že ocenil/a.",
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
    } else {
      return res.status(400).json({
        message: "Prosimo, izberi veljavno vlogo.",
      });
    }
  }
};

module.exports = {
  createRating,
};

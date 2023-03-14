const Sequelize = require("sequelize");
const { sequelize, Recurring, Vehicle, User } = require("../models/db");

// Get all recurring rides for the authorised user
const getRecurringRides = (req, res) => {
  Recurring.findAll({
    where: { userId: req.auth.id, offered: false },
  })
    .then((recurring) => {
      return res.status(200).json(recurring);
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
      });
    });
};

// Get a recurring ride with the given ID
const getRecurringRide = (req, res) => {
  Recurring.findOne({
    where: { id: req.params.id, userId: req.auth.id, offered: false },
  })
    .then((recurring) => {
      if (recurring) {
        return res.status(200).json(recurring);
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
};

// Create a new recurring ride
const createRecurringRide = (req, res) => {
  if (
    !req.body.start ||
    !req.body.startSimple ||
    !req.body.startLatitude ||
    !req.body.startLongitude ||
    !req.body.end ||
    !req.body.endSimple ||
    !req.body.endLatitude ||
    !req.body.endLongitude
  ) {
    return res.status(400).json({
      message: "Prosimo, izberi začetno in končno lokacijo.",
    });
  } else if (!req.body.passengers || Math.floor(req.body.passengers) <= 0) {
    return res.status(400).json({
      message: "Izberi ustrezno število potnikov za prevoz.",
    });
  } else if (Math.floor(req.body.baggage) < 0) {
    return res.status(400).json({
      message: "Vnešen prostor za prtljago ni veljaven.",
    });
  } else {
    if (req.body.baggage == null) {
      req.body.baggage = 0;
    }

    Recurring.create({
      passengers: req.body.passengers,
      baggage: req.body.baggage,
      start: req.body.start,
      startSimple: req.body.startSimple,
      startLatitude: req.body.startLatitude,
      startLongitude: req.body.startLongitude,
      end: req.body.end,
      endSimple: req.body.endSimple,
      endLatitude: req.body.endLatitude,
      endLongitude: req.body.endLongitude,
      mondays: req.body.mondays,
      tuesdays: req.body.tuesdays,
      wednesdays: req.body.wednesdays,
      thursdays: req.body.thursdays,
      fridays: req.body.fridays,
      saturdays: req.body.saturdays,
      sundays: req.body.sundays,
      departure: `${req.body.hours}:${req.body.minutes}:00`,
      offered: false,
      userId: req.auth.id,
    })
      .then((recurring) => {
        return res.status(201).json(recurring);
      })
      .catch((error) => {
        return res.status(500).json({
          message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
        });
      });
  }
};

// Update a recurring ride with the given ID
const updateRecurringRide = (req, res) => {
  if (
    !req.body.start ||
    !req.body.startSimple ||
    !req.body.startLatitude ||
    !req.body.startLongitude ||
    !req.body.end ||
    !req.body.endSimple ||
    !req.body.endLatitude ||
    !req.body.endLongitude
  ) {
    return res.status(400).json({
      message: "Prosimo, izberi začetno in končno lokacijo.",
    });
  } else if (!req.body.passengers || Math.floor(req.body.passengers) <= 0) {
    return res.status(400).json({
      message: "Izberi ustrezno število potnikov za prevoz.",
    });
  } else if (Math.floor(req.body.baggage) < 0) {
    return res.status(400).json({
      message: "Vnešen prostor za prtljago ni veljaven.",
    });
  } else {
    if (req.body.baggage == null) {
      req.body.baggage = 0;
    }

    Recurring.findOne({
      where: { id: req.params.id, userId: req.auth.id, offered: false },
    })
      .then((recurring) => {
        if (recurring) {
          recurring
            .update({
              passengers: req.body.passengers,
              baggage: req.body.baggage,
              start: req.body.start,
              startSimple: req.body.startSimple,
              startLatitude: req.body.startLatitude,
              startLongitude: req.body.startLongitude,
              end: req.body.end,
              endSimple: req.body.endSimple,
              endLatitude: req.body.endLatitude,
              endLongitude: req.body.endLongitude,
              mondays: req.body.mondays,
              tuesdays: req.body.tuesdays,
              wednesdays: req.body.wednesdays,
              thursdays: req.body.thursdays,
              fridays: req.body.fridays,
              saturdays: req.body.saturdays,
              sundays: req.body.sundays,
              departure: `${req.body.hours}:${req.body.minutes}:00`,
            })
            .then((recurring) => {
              return res.status(200).json(recurring);
            })
            .catch((error) => {
              return res.status(500).json({
                message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
              });
            });
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
  }
};

// Delete a recurring ride with the given ID
const deleteRecurringRide = (req, res) => {
  Recurring.findOne({
    where: { id: req.params.id, userId: req.auth.id, offered: false },
  })
    .then((recurring) => {
      if (recurring) {
        recurring
          .destroy()
          .then(() => {
            return res.status(204).json({});
          })
          .catch((error) => {
            return res.status(500).json({
              message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
            });
          });
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
};

// Get all recurring offers for the authorised user
const getRecurringOffers = (req, res) => {
  Recurring.findAll({
    where: { userId: req.auth.id, offered: true },
  })
    .then((recurring) => {
      return res.status(200).json(recurring);
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
      });
    });
};

// Get a recurring offer with the given ID
const getRecurringOffer = (req, res) => {
  Recurring.findOne({
    where: { id: req.params.id, userId: req.auth.id, offered: true },
  })
    .then((recurring) => {
      if (recurring) {
        return res.status(200).json(recurring);
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
};

// Create a new recurring offer
const createRecurringOffer = (req, res) => {
  if (
    !req.body.start ||
    !req.body.startSimple ||
    !req.body.startLatitude ||
    !req.body.startLongitude ||
    !req.body.end ||
    !req.body.endSimple ||
    !req.body.endLatitude ||
    !req.body.endLongitude
  ) {
    return res.status(400).json({
      message: "Prosimo, izberi začetno in končno lokacijo.",
    });
  } else if (!req.body.passengers || Math.floor(req.body.passengers) <= 0) {
    return res.status(400).json({
      message: "Izberi ustrezno število potnikov za prevoz.",
    });
  } else if (Math.floor(req.body.baggage) < 0) {
    return res.status(400).json({
      message: "Vnešen prostor za prtljago ni veljaven.",
    });
  } else if (!req.body.vehicle) {
    return res.status(400).json({
      message: "Prosimo, izberi vozilo za prevoz.",
    });
  } else if (!req.body.price) {
    return res.status(400).json({
      message: "Prosimo, vnesi strošek prevoza.",
    });
  } else {
    if (req.body.baggage == null) {
      req.body.baggage = 0;
    }

    Vehicle.findOne({ where: { id: req.body.vehicle, ownerId: req.auth.id } })
      .then((vehicle) => {
        if (vehicle) {
          if (vehicle.passengers >= req.body.passengers && vehicle.baggage >= req.body.baggage) {
            Recurring.create({
              vehicleId: req.body.vehicle,
              price: req.body.price,
              description: req.body.description,
              passengers: req.body.passengers,
              baggage: req.body.baggage,
              start: req.body.start,
              startSimple: req.body.startSimple,
              startLatitude: req.body.startLatitude,
              startLongitude: req.body.startLongitude,
              end: req.body.end,
              endSimple: req.body.endSimple,
              endLatitude: req.body.endLatitude,
              endLongitude: req.body.endLongitude,
              mondays: req.body.mondays,
              tuesdays: req.body.tuesdays,
              wednesdays: req.body.wednesdays,
              thursdays: req.body.thursdays,
              fridays: req.body.fridays,
              saturdays: req.body.saturdays,
              sundays: req.body.sundays,
              departure: `${req.body.hours}:${req.body.minutes}:00`,
              offered: true,
              userId: req.auth.id,
            })
              .then((recurring) => {
                return res.status(201).json(recurring);
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

// Update a recurring offer with the given ID
const updateRecurringOffer = (req, res) => {
  if (
    !req.body.start ||
    !req.body.startSimple ||
    !req.body.startLatitude ||
    !req.body.startLongitude ||
    !req.body.end ||
    !req.body.endSimple ||
    !req.body.endLatitude ||
    !req.body.endLongitude
  ) {
    return res.status(400).json({
      message: "Prosimo, izberi začetno in končno lokacijo.",
    });
  } else if (!req.body.passengers || Math.floor(req.body.passengers) <= 0) {
    return res.status(400).json({
      message: "Izberi ustrezno število potnikov za prevoz.",
    });
  } else if (Math.floor(req.body.baggage) < 0) {
    return res.status(400).json({
      message: "Vnešen prostor za prtljago ni veljaven.",
    });
  } else {
    if (req.body.baggage == null) {
      req.body.baggage = 0;
    }

    Recurring.findOne({
      where: { id: req.params.id, userId: req.auth.id, offered: true },
    })
      .then((recurring) => {
        if (recurring) {
          Vehicle.findOne({ where: { id: req.body.vehicle, ownerId: req.auth.id } })
            .then((vehicle) => {
              if (vehicle) {
                if (vehicle.passengers >= req.body.passengers && vehicle.baggage >= req.body.baggage) {
                  recurring
                    .update({
                      vehicleId: req.body.vehicle,
                      price: req.body.price,
                      description: req.body.description,
                      passengers: req.body.passengers,
                      baggage: req.body.baggage,
                      start: req.body.start,
                      startSimple: req.body.startSimple,
                      startLatitude: req.body.startLatitude,
                      startLongitude: req.body.startLongitude,
                      end: req.body.end,
                      endSimple: req.body.endSimple,
                      endLatitude: req.body.endLatitude,
                      endLongitude: req.body.endLongitude,
                      mondays: req.body.mondays,
                      tuesdays: req.body.tuesdays,
                      wednesdays: req.body.wednesdays,
                      thursdays: req.body.thursdays,
                      fridays: req.body.fridays,
                      saturdays: req.body.saturdays,
                      sundays: req.body.sundays,
                      departure: `${req.body.hours}:${req.body.minutes}:00`,
                    })
                    .then((recurring) => {
                      return res.status(200).json(recurring);
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
  }
};

// Delete a recurring offer with the given ID
const deleteRecurringOffer = (req, res) => {
  Recurring.findOne({
    where: { id: req.params.id, userId: req.auth.id, offered: true },
  })
    .then((recurring) => {
      if (recurring) {
        recurring
          .destroy()
          .then(() => {
            return res.status(204).json({});
          })
          .catch((error) => {
            return res.status(500).json({
              message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
            });
          });
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
};

module.exports = {
  getRecurringRides,
  getRecurringRide,
  createRecurringRide,
  updateRecurringRide,
  deleteRecurringRide,
  getRecurringOffers,
  getRecurringOffer,
  createRecurringOffer,
  updateRecurringOffer,
  deleteRecurringOffer,
};

const Sequelize = require("sequelize");
const { sequelize, Vehicle } = require("../models/db");

// Get all vehicles for the authorised user
const getVehicles = (req, res) => {
  console.log(req.auth);
  Vehicle.findAll({ attributes: ["id", "model", "licencePlate", "passengers", "baggage"], where: { ownerId: req.auth.id } })
    .then((vehicles) => {
      return res.status(200).json(vehicles);
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
      });
    });
};

// Get a vehicle with the given ID
const getVehicle = (req, res) => {
  Vehicle.findOne({
    attributes: ["id", "model", "licencePlate", "passengers", "baggage"],
    where: { id: req.params.id, ownerId: req.auth.id },
  })
    .then((vehicle) => {
      if (vehicle) {
        return res.status(200).json(vehicle);
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

// Create a new vehicle
const createVehicle = (req, res) => {
  if (!req.body.model) {
    return res.status(400).json({
      message: "Prosimo, vnesi znamko in model vozila.",
    });
  } else if (!req.body.licencePlate) {
    return res.status(400).json({
      message: "Prosimo, vnesi registrsko številko vozila.",
    });
  } else if (!req.body.passengers || Math.floor(req.body.passengers) <= 0) {
    return res.status(400).json({
      message: "Na voljo mora biti prostor za vsaj enega potnika.",
    });
  } else if (Math.floor(req.body.baggage) < 0) {
    return res.status(400).json({
      message: "Vnešen prostor za prtljago ni veljaven.",
    });
  } else {
    Vehicle.create({
      model: req.body.model,
      licencePlate: req.body.licencePlate,
      passengers: Math.floor(req.body.passengers),
      baggage: Math.floor(req.body.baggage),
      ownerId: req.auth.id,
    })
      .then((vehicle) => {
        return res.status(201).json(vehicle);
      })
      .catch((error) => {
        return res.status(500).json({
          message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
        });
      });
  }
};

// Update a vehicle with the given ID
const updateVehicle = (req, res) => {
  if (!req.body.model) {
    return res.status(400).json({
      message: "Prosimo, vnesi znamko in model vozila.",
    });
  } else if (!req.body.licencePlate) {
    return res.status(400).json({
      message: "Prosimo, vnesi registrsko številko vozila.",
    });
  } else if (!req.body.passengers || Math.floor(req.body.passengers) <= 0) {
    return res.status(400).json({
      message: "Na voljo mora biti prostor za vsaj enega potnika.",
    });
  } else if (Math.floor(req.body.baggage) < 0) {
    return res.status(400).json({
      message: "Vnešen prostor za prtljago ni veljaven.",
    });
  } else {
    Vehicle.findOne({ where: { id: req.params.id, ownerId: req.auth.id } })
      .then((vehicle) => {
        if (vehicle) {
          vehicle
            .update({
              model: req.body.model,
              licencePlate: req.body.licencePlate,
              passengers: Math.floor(req.body.passengers),
              baggage: Math.floor(req.body.baggage),
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
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
};

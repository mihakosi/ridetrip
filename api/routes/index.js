var express = require("express");
var router = express.Router();

var jwt = require("express-jwt");
var authentication = jwt({
  secret: process.env.JWT_PASSWORD,
  userProperty: "payload",
});

const offersController = require("../controllers/offers");
const ridesController = require("../controllers/rides");
const reservationsController = require("../controllers/reservations");
const vehiclesController = require("../controllers/vehicles");
const authController = require("../controllers/auth");

/* Offers */
router.get("/offers", authentication, offersController.getOffers);
router.get("/offers/:id", authentication, offersController.getOffer);
router.post("/offers", authentication, offersController.createOffer);

/* Rides */
router.get("/rides", authentication, ridesController.getRides);
router.get("/rides/:id", authentication, ridesController.getRide);

/* Reservations */
router.get("/reservations", authentication, reservationsController.getReservations);
router.get("/reservations/:id", authentication, reservationsController.getReservation);
router.post("/reservations", authentication, reservationsController.createReservation);
router.put("/reservations/:id/cancel", authentication, reservationsController.cancelReservation);

/* Vehicles */
router.get("/vehicles", authentication, vehiclesController.getVehicles);
router.get("/vehicles/:id", authentication, vehiclesController.getVehicle);
router.post("/vehicles", authentication, vehiclesController.createVehicle);
router.put("/vehicles/:id", authentication, vehiclesController.updateVehicle);
router.delete("/vehicles/:id", authentication, vehiclesController.deleteVehicle);

/* Authentication */
router.post("/auth/signin", authController.signIn);
router.post("/auth/signup", authController.signUp);
router.get("/auth/user", authentication, authController.getUser);
router.put("/auth/user", authentication, authController.updateUser);

module.exports = router;

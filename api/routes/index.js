var express = require("express");
var router = express.Router();

var jwt = require("express-jwt");
var authentication = jwt({
  secret: process.env.JWT_PASSWORD,
  userProperty: "payload",
});

const offersController = require("../controllers/offers");
const ratingsController = require("../controllers/ratings");
const ridesController = require("../controllers/rides");
const reservationsController = require("../controllers/reservations");
const vehiclesController = require("../controllers/vehicles");
const authController = require("../controllers/auth");

/* Offers */
router.get("/offers", authentication, offersController.getOffers);
router.get("/offers/:id", authentication, offersController.getOffer);
router.post("/offers", authentication, offersController.createOffer);
router.put("/offers/:id/cancel", authentication, offersController.cancelOffer);
router.get("/offers/:id/location", authentication, offersController.getLocation);
router.put("/offers/:id/location", authentication, offersController.shareLocation);
router.get("/offers/:id/passengers", authentication, offersController.getPassengers);

/* Ratings */
router.post("/ratings", authentication, ratingsController.createRating);

/* Rides */
router.get("/rides", authentication, ridesController.getRides);
router.get("/rides/:id", authentication, ridesController.getRide);

/* Reservations */
router.get("/reservations", authentication, reservationsController.getReservations);
router.get("/reservations/:id", authentication, reservationsController.getReservation);
router.post("/reservations", authentication, reservationsController.createReservation);
router.put("/reservations/:id/cancel", authentication, reservationsController.cancelReservation);
router.get("/reservations/:id/location", authentication, reservationsController.getLocation);
router.put("/reservations/:id/location", authentication, reservationsController.shareLocation);
router.get("/reservations/:id/driver", authentication, reservationsController.getDriver);

/* Vehicles */
router.get("/vehicles", authentication, vehiclesController.getVehicles);
router.get("/vehicles/:id", authentication, vehiclesController.getVehicle);
router.post("/vehicles", authentication, vehiclesController.createVehicle);
router.put("/vehicles/:id", authentication, vehiclesController.updateVehicle);

/* Authentication */
router.post("/auth/signin", authController.signIn);
router.post("/auth/signup", authController.signUp);
router.get("/auth/user", authentication, authController.getUser);
router.put("/auth/user", authentication, authController.updateUser);
router.put("/auth/user/image", authentication, authController.updateUserImage);

module.exports = router;

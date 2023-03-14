const Sequelize = require("sequelize");
const { sequelize, Offer, Route } = require("../models/db");

const getDestinations = (req, res) => {
  if (!req.query.latitude || !req.query.longitude) {
    return res.status(400).json({
      message: "Za prikaz možnih prevozov dovoli uporabo lokacije.",
    });
  } else {
    let date = new Date();
    let week = new Date();
    week.setDate(week.getDate() + 7);

    Route.findAll({
      attributes: [
        "end",
        "endLatitude",
        "endLongitude",
        [
          sequelize.literal(
            `point(${req.query.longitude}, ${req.query.latitude}) <@> point("routes"."startLongitude", "routes"."startLatitude")::point`
          ),
          "distance",
        ],
      ],
      include: {
        model: Offer,
        as: "offer",
        attributes: [],
        where: {
          active: true,
        },
      },
      where: {
        departure: {
          [Sequelize.Op.between]: [date, week],
        },
      },
      group: ["routes.id"],
      having: sequelize.literal(
        `point(${req.query.longitude}, ${req.query.latitude}) <@> point("routes"."startLongitude", "routes"."startLatitude")::point < 18`
      ),
    })
      .then((destinations) => {
        return res.status(200).json(destinations);
      })
      .catch((error) => {
        return res.status(500).json({
          message: "Nekaj je šlo narobe. Prosimo, poskusi znova.",
        });
      });
  }
};

module.exports = {
  getDestinations,
};

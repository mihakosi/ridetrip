module.exports = function (sequelize, DataTypes) {
  let RouteReservation = sequelize.define(
    "routeReservations",
    {},
    {
      timestamps: false,
    }
  );

  return RouteReservation;
};

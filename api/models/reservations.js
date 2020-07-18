module.exports = function (sequelize, DataTypes) {
  let Reservation = sequelize.define(
    "reservations",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      passengers: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      baggage: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      cancellationReason: {
        type: DataTypes.TEXT,
      },
      latitude: {
        type: DataTypes.DOUBLE,
      },
      longitude: {
        type: DataTypes.DOUBLE,
      },
      driverRated: {
        type: DataTypes.BOOLEAN,
      },
      passengerRated: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      timestamps: false,
    }
  );

  return Reservation;
};

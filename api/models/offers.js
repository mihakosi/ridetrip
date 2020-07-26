module.exports = function (sequelize, DataTypes) {
  let Offer = sequelize.define(
    "offers",
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
      description: {
        type: DataTypes.TEXT,
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
    },
    {
      timestamps: false,
    }
  );

  return Offer;
};

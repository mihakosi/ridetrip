module.exports = function (sequelize, DataTypes) {
  let Vehicle = sequelize.define(
    "vehicles",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      model: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      licencePlate: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      passengers: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      baggage: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );

  return Vehicle;
};

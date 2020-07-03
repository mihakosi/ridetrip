module.exports = function (sequelize, DataTypes) {
  let Route = sequelize.define(
    "routes",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      start: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      startSimple: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      startLatitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      startLongitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      end: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      endSimple: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      endLatitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      endLongitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      departure: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );

  return Route;
};

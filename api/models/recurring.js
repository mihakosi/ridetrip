module.exports = function (sequelize, DataTypes) {
  let Recurring = sequelize.define(
    "recurring",
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
        type: DataTypes.TIME,
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
      mondays: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      tuesdays: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      wednesdays: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      thursdays: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      fridays: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      saturdays: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      sundays: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      offered: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      price: {
        type: DataTypes.FLOAT,
      },
      description: {
        type: DataTypes.TEXT,
      },
    },
    {
      timestamps: false,
    }
  );

  return Recurring;
};

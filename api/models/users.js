module.exports = function (sequelize, DataTypes) {
  let User = sequelize.define(
    "users",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: {
        type: DataTypes.BLOB("tiny"),
        allowNull: true,
        get() {
          return this.getDataValue("image") ? this.getDataValue("image").toString("ascii") : this.getDataValue("image");
        },
      },
    },
    {
      timestamps: false,
    }
  );

  return User;
};

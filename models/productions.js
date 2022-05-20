"use strict";
const { Model } = require("sequelize");
const Characters_Productions = require("./characters_productions");
const Genres_Productions = require("./genres_productions");

module.exports = (sequelize, DataTypes) => {
  class Productions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Productions.belongsToMany(models.Genres, {
        through: models.Genres_Productions,
        foreignKey: "ProductionId",
        otherKey: "GenreId",
      });
      models.Productions.belongsToMany(models.Characters, {
        through: models.Characters_Productions,
        foreignKey: "ProductionId",
        otherKey: "CharacterId",
      });
    }
  }
  Productions.init(
    {
      image: {
        type: DataTypes.STRING,
      },
      title: {
        type: DataTypes.STRING,
        validate: { is: /^[a-z0-9. ]+$/i, len: [2, 125] },
      },
      creation: {
        type: DataTypes.DATEONLY,
        validate: {
          isBefore: new Date().toISOString().split("T")[0],
        },
      },
      score: {
        type: DataTypes.FLOAT,
        min: 0,
        max: 5,
        validate: { isDecimal: true },
      },
    },
    {
      sequelize,
      modelName: "Productions",
      omitNull: false,
    }
  );
  return Productions;
};

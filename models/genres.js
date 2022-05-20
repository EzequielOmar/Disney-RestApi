"use strict";
const { Model } = require("sequelize");
const Genres_Productions = require("./genres_productions");

module.exports = (sequelize, DataTypes) => {
  class Genres extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Genres.belongsToMany(models.Productions, {
        through: models.Genres_Productions,
        foreignKey: "GenreId",
        otherKey: "ProductionId",
      });
    }
  }
  Genres.init(
    {
      image: {
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
        validate: { isAlpha: true, len: [2, 125] },
      },
    },
    {
      sequelize,
      modelName: "Genres",
      omitNull: false,
    }
  );
  return Genres;
};

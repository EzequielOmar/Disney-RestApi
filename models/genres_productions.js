"use strict";
const { Model } = require("sequelize");
const Genres = require("./genres");
const Productions = require("./productions");

module.exports = (sequelize, DataTypes) => {
  class Genres_Productions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Genres_Productions.belongsTo(models.Productions, {
        foreignKey: "ProductionId",
        targetKey: "id",
      });
      models.Genres_Productions.belongsTo(models.Genres, {
        foreignKey: "GenreId",
        targetKey: "id",
      });
    }
  }
  Genres_Productions.init(
    {},
    {
      sequelize,
      modelName: "Genres_Productions",
      omitNull: false,
      timestamps: false,
    }
  );
  return Genres_Productions;
};

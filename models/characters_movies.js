"use strict";
const { Model } = require("sequelize");
const Characters = require("./characters");
const Movies = require("./movies");

module.exports = (sequelize, DataTypes) => {
  class Characters_Movies extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Characters_Movies.belongsTo(models.Movies, {
        foreignKey: "MovieId",
        targetKey: "id",
      });
      models.Characters_Movies.belongsTo(models.Characters, {
        foreignKey: "CharacterId",
        targetKey: "id",
      });
    }
  }
  Characters_Movies.init(
    {},
    {
      sequelize,
      modelName: "Characters_Movies",
      omitNull: false,
      timestamps: false,
    }
  );
  return Characters_Movies;
};

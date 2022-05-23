"use strict";
const { Model } = require("sequelize");
const Genres = require("./genres");
const Movies = require("./movies");

module.exports = (sequelize, DataTypes) => {
  class Genres_Movies extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Genres_Movies.belongsTo(models.Movies, {
        foreignKey: "MovieId",
        targetKey: "id",
      });
      models.Genres_Movies.belongsTo(models.Genres, {
        foreignKey: "GenreId",
        targetKey: "id",
      });
    }
  }
  Genres_Movies.init(
    {},
    {
      sequelize,
      modelName: "Genres_Movies",
      omitNull: false,
      timestamps: false,
    }
  );
  return Genres_Movies;
};

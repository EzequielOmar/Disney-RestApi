"use strict";
const { Model } = require("sequelize");
const Characters_Movies = require("./characters_movies");
const Genres_Movies = require("./genres_movies");

module.exports = (sequelize, DataTypes) => {
  class Movies extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Movies.belongsToMany(models.Genres, {
        through: models.Genres_Movies,
        foreignKey: "MovieId",
        otherKey: "GenreId",
      });
      models.Movies.belongsToMany(models.Characters, {
        through: models.Characters_Movies,
        foreignKey: "MovieId",
        otherKey: "CharacterId",
      });
    }
  }
  Movies.init(
    {
      image: {
        type: DataTypes.STRING,
      },
      title: {
        type: DataTypes.STRING,
        validate: { len: [2, 125] },
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
      modelName: "Movies",
      omitNull: false,
    }
  );
  return Movies;
};

"use strict";
const { Model } = require("sequelize");
const Characters_Movies = require("./characters_movies");

module.exports = (sequelize, DataTypes) => {
  class Characters extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Characters.belongsToMany(models.Movies, {
        through: models.Characters_Movies,
        foreignKey: "CharacterId",
        otherKey: "MovieId",
      });
    }
  }
  Characters.init(
    {
      image: {
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
        validate: { is: /^[a-z`' ]+$/i, len: [2, 125] },
      },
      age: {
        type: DataTypes.INTEGER,
        validate: { isInt: true, min: 0 },
      },
      weight: {
        type: DataTypes.FLOAT,
        validate: { isDecimal: true, min: 0 },
      },
      story: {
        type: DataTypes.STRING,
        max: 225,
      },
    },
    {
      sequelize,
      modelName: "Characters",
      omitNull: false,
    }
  );
  return Characters;
};

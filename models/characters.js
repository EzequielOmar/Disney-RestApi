"use strict";
const { Model } = require("sequelize");
const Characters_Productions = require("./characters_productions");

module.exports = (sequelize, DataTypes) => {
  class Characters extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Characters.belongsToMany(models.Productions, {
        through: models.Characters_Productions,
        foreignKey: "CharacterId",
        otherKey: "ProductionId",
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
        validate: { is: /^[a-z ]+$/i, len: [2, 125] },
      },
      age: {
        type: DataTypes.INTEGER,
        validate: { isInt: true },
      },
      weight: {
        type: DataTypes.FLOAT,
        validate: { isDecimal: true },
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

"use strict";
const { Model } = require("sequelize");
const Characters = require("./characters");
const Productions = require("./productions");

module.exports = (sequelize, DataTypes) => {
  class Characters_Productions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Characters_Productions.belongsTo(models.Productions, {
        foreignKey: "ProductionId",
        targetKey: "id",
      });
      models.Characters_Productions.belongsTo(models.Characters, {
        foreignKey: "CharacterId",
        targetKey: "id",
      });
    }
  }
  Characters_Productions.init(
    {},
    {
      sequelize,
      modelName: "Characters_Productions",
      omitNull: false,
      timestamps: false,
    }
  );
  return Characters_Productions;
};

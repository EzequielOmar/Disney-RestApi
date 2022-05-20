"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert("Characters_Productions", [
      {
        id: 1,
        CharacterId: 1,
        ProductionId: 1,
      },
      {
        id: 2,
        CharacterId: 2,
        ProductionId: 1,
      },
      {
        id: 3,
        CharacterId: 3,
        ProductionId: 2,
      },
    ]),

  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete("Characters_Productions", null, {}),
};

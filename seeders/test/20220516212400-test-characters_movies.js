"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert("Characters_Movies", [
      {
        id: 1,
        CharacterId: 1,
        MovieId: 1,
      },
      {
        id: 2,
        CharacterId: 2,
        MovieId: 1,
      },
      {
        id: 3,
        CharacterId: 3,
        MovieId: 2,
      },
    ]),

  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete("Characters_Movies", null, {}),
};

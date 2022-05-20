"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert("Genres_Productions", [
      {
        id: 1,
        GenreId: 1,
        ProductionId: 1,
      },
      {
        id: 2,
        GenreId: 2,
        ProductionId: 2,
      },
    ]),

  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete("Genres_Productions", null, {}),
};

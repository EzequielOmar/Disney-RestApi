"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert("Genres_Movies", [
      {
        id: 1,
        GenreId: 1,
        MovieId: 1,
      },
      {
        id: 2,
        GenreId: 2,
        MovieId: 2,
      },
    ]),

  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete("Genres_Movies", null, {}),
};

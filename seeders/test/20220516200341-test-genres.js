"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert("Genres", [
      {
        id: 1,
        image: "das4d56s1d2as4d48s7das5das.jpeg",
        name: "Adventure",
      },
      {
        id: 2,
        image: "yt56re74yret1y35rret1erte.jpeg",
        name: "Spooky",
      },
    ]),

  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete("Genres", null, {}),
};

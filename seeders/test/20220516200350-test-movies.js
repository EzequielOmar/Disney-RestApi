"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert("Movies", [
      {
        id: 1,
        image: "das4d56s1d2as4d48s7das5das.jpeg",
        title: "Tom & Jerry Adventures",
        creation: "2012-04-12",
        score: 4.15,
      },
      {
        id: 2,
        image: "yt56re74yret1y35rret1erte.jpeg",
        title: "Monsters Inc",
        creation: "2002-04-12",
        score: 4.75,
      },
    ]),

  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete("Movies", null, {}),
};

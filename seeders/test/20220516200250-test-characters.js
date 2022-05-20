"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert("Characters", [
      {
        id: 1,
        image: "das4d56s1d2as4d48s7das5das.jpeg",
        name: "Tom",
        age: 2,
        weight: 1.45,
        story: "Tom is always chasing Jerry.",
      },
      {
        id: 2,
        image: "yt56re74yret1y35rret1erte.jpeg",
        name: "Jerry",
        age: 1,
        weight: 0.25,
        story: "Jerry is always fooling Tom.",
      },
      {
        id: 3,
        image: "qtre2t3ert5678.1ftreter.jpeg",
        name: "Mike Wasosky",
        age: 450,
        weight: 6.45,
        story: "He did not do his paper work last nigth, WATCH OUT!",
      },
    ]),

  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete("Characters", null, {}),
};

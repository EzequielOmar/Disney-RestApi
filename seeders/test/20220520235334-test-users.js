"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert("Users", [
      {
        id: 1,
        email: "test@gmail.com",
        //* Pass is` testing `
        pass: "$2a$07$JT/zN6noaYLjyjElAneM8.Kn9P94VaBsymwgiBJdcNlqeRPeoXVde",
      },
    ]),

  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete("Users", null, {}),
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    // Add new 'name' column
    await queryInterface.addColumn('Kids', 'name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {

    // Remove 'name' column
    await queryInterface.removeColumn('Kids', 'name');
  },
};

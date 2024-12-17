'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove 'first_name' and 'last_name' columns
    await queryInterface.removeColumn('Parents', 'first_name');
    await queryInterface.removeColumn('Parents', 'last_name');

    // Add new 'name' column
    await queryInterface.addColumn('Parents', 'name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Re-add 'first_name' column
    await queryInterface.addColumn('Parents', 'first_name', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // Re-add 'last_name' column
    await queryInterface.addColumn('Parents', 'last_name', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // Remove 'name' column
    await queryInterface.removeColumn('Parents', 'name');
  },
};

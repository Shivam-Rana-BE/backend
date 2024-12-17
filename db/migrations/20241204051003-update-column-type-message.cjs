'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns with the correct type (ARRAY of INTEGER)
    await queryInterface.addColumn('Messages', 'seen', {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      allowNull: true,
    });

    await queryInterface.addColumn('Messages', 'delivered', {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the new columns if reverting
    await queryInterface.removeColumn('Messages', 'seen');
    await queryInterface.removeColumn('Messages', 'delivered');
  },
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop the old columns
    await queryInterface.removeColumn('Messages', 'seen');
    await queryInterface.removeColumn('Messages', 'delivered');
  },

  down: async (queryInterface, Sequelize) => {
    // Add the old columns back (assuming they were originally STRING[])
    await queryInterface.addColumn('Messages', 'seen', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    });

    await queryInterface.addColumn('Messages', 'delivered', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    });
  },
};
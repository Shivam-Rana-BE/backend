'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Parents', 'attachments', {
      type: Sequelize.ARRAY(Sequelize.STRING), // Array of strings for file URLs
      allowNull: true, // Optional field
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Parents', 'attachments');
  },
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'isDeleted', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,  // Set default to false (not deleted)
      allowNull: false,      // Ensures a value must always be provided
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'isDeleted');
  }
};

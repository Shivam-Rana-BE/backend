'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Parents', 'profile_image', {
      type: Sequelize.STRING,
      allowNull: true,  // Set to true if it's optional
      defaultValue: null,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Parents', 'profile_image');
  },
};

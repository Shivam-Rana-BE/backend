'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Parents', 'attachments');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Parents', 'attachments', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    });
  },
};

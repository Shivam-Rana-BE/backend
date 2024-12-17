'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('Kids', 'profile_image', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('Kids', 'uuid', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('Kids', 'profile_image'),
      queryInterface.removeColumn('Kids', 'uuid'),
    ]);
  }
};

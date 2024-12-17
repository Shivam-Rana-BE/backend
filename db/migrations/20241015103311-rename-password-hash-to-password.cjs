'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('Users', 'password_hash', 'password');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('Users', 'password', 'password_hash');
  }
};

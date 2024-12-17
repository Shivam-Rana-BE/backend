'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add 'TherapyCenter' to the enum type manually
    await queryInterface.sequelize.query(`
        ALTER TYPE "enum_Users_user_type" ADD VALUE 'TherapyCenter';
      `);

  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};

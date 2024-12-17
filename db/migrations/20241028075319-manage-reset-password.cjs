'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Parents', 'reset_password_code', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Therapists', 'reset_password_code', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('TherapistCenters', 'reset_password_code', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Parents', 'reset_password_expires', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Therapists', 'reset_password_expires', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('TherapistCenters', 'reset_password_expires', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Parents', 'reset_password_code');
    await queryInterface.removeColumn('Therapists', 'reset_password_code');
    await queryInterface.removeColumn('TherapistCenters', 'reset_password_code');
    await queryInterface.removeColumn('Parents', 'reset_password_expires');
    await queryInterface.removeColumn('Therapists', 'reset_password_expires');
    await queryInterface.removeColumn('TherapistCenters', 'reset_password_expires');
  }
};
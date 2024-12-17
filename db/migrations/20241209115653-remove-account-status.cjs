'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the column exists before attempting to remove it
    const therapistCentersTable = await queryInterface.describeTable('TherapistCenters');
    if (therapistCentersTable.account_status) {
      await queryInterface.removeColumn('TherapistCenters', 'account_status');
    }

    const therapistsTable = await queryInterface.describeTable('Therapists');
    if (therapistsTable.account_status) {
      await queryInterface.removeColumn('Therapists', 'account_status');
    }
  },

  async down(queryInterface, Sequelize) {
    // Re-add the columns if they do not exist
    const therapistCentersTable = await queryInterface.describeTable('TherapistCenters');
    if (!therapistCentersTable.account_status) {
      await queryInterface.addColumn('TherapistCenters', 'account_status', {
        type: Sequelize.ENUM('Active', 'Inactive', 'Suspended'),
        defaultValue: 'Active',
        allowNull: false,
      });
    }

    const therapistsTable = await queryInterface.describeTable('Therapists');
    if (!therapistsTable.account_status) {
      await queryInterface.addColumn('Therapists', 'account_status', {
        type: Sequelize.ENUM('Active', 'Inactive', 'Suspended'),
        defaultValue: 'Active',
        allowNull: false,
      });
    }
  },
};

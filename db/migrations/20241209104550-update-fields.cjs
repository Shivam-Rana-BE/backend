'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add account_status column if it doesn't already exist
    const hasAccountStatusColumn = await queryInterface.describeTable('Users').then(columns => columns.account_status);
    if (!hasAccountStatusColumn) {
      await queryInterface.addColumn('Users', 'account_status', {
        type: Sequelize.ENUM('Active', 'Inactive', 'Suspended'),
        defaultValue: 'Active',
      });
    }

    // Add is_available and is_profile_complete columns if they don't already exist
    const hasIsAvailableColumn = await queryInterface.describeTable('TherapistCenters').then(columns => columns.is_available);
    if (!hasIsAvailableColumn) {
      await queryInterface.addColumn('TherapistCenters', 'is_available', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      });
    }

    const hasIsProfileCompleteColumn = await queryInterface.describeTable('TherapistCenters').then(columns => columns.is_profile_complete);
    if (!hasIsProfileCompleteColumn) {
      await queryInterface.addColumn('TherapistCenters', 'is_profile_complete', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      });
    }

    const hasTherapistProfileCompleteColumn = await queryInterface.describeTable('Therapists').then(columns => columns.is_profile_complete);
    if (!hasTherapistProfileCompleteColumn) {
      await queryInterface.addColumn('Therapists', 'is_profile_complete', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      });
    }

    // Remove old columns
    await queryInterface.removeColumn('TherapistCenters', 'reset_password_code');
    await queryInterface.removeColumn('Therapists', 'reset_password_code');
    await queryInterface.removeColumn('Parents', 'reset_password_code');

    await queryInterface.removeColumn('TherapistCenters', 'reset_password_expires');
    await queryInterface.removeColumn('Therapists', 'reset_password_expires');
    await queryInterface.removeColumn('Parents', 'reset_password_expires');
  },

  async down(queryInterface, Sequelize) {
    // Add the removed columns back
    await queryInterface.addColumn('TherapistCenters', 'reset_password_code', {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn('Therapists', 'reset_password_code', {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn('Parents', 'reset_password_code', {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn('TherapistCenters', 'reset_password_expires', {
      type: Sequelize.DATE,
    });
    await queryInterface.addColumn('Therapists', 'reset_password_expires', {
      type: Sequelize.DATE,
    });
    await queryInterface.addColumn('Parents', 'reset_password_expires', {
      type: Sequelize.DATE,
    });

    // Remove the added columns
    await queryInterface.removeColumn('Users', 'account_status');
    await queryInterface.removeColumn('TherapistCenters', 'is_available');
    await queryInterface.removeColumn('TherapistCenters', 'is_profile_complete');
    await queryInterface.removeColumn('Therapists', 'is_profile_complete');
  }
};

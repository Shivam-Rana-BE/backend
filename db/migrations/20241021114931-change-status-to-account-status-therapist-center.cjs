'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('TherapistCenters');

    // 1. Add the `account_status` column with ENUM type if it doesn't exist
    if (!tableInfo.account_status) {
      await queryInterface.addColumn('TherapistCenters', 'account_status', {
        type: Sequelize.ENUM('Active', 'Inactive', 'Suspended'),
        defaultValue: 'Active',
        allowNull: false,
      });
    }

    // 2. Migrate data from `status` (if it exists) to `account_status`
    if (tableInfo.status) {
      await queryInterface.sequelize.query(`
        UPDATE "TherapistCenters"
        SET "account_status" = CASE 
          WHEN "status" = true THEN 'Active'
          ELSE 'Inactive'
        END
      `);

      // 3. Remove the old `status` column
      await queryInterface.removeColumn('TherapistCenters', 'status');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('TherapistCenters');

    // 1. Re-add `status` column if it doesn't exist
    if (!tableInfo.status) {
      await queryInterface.addColumn('TherapistCenters', 'status', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      });
    }

    // 2. Revert `account_status` data back to `status`
    if (tableInfo.account_status) {
      await queryInterface.sequelize.query(`
        UPDATE "TherapistCenters"
        SET "status" = CASE 
          WHEN "account_status" = 'Active' THEN true
          ELSE false
        END
      `);

      // 3. Remove `account_status` column
      await queryInterface.removeColumn('TherapistCenters', 'account_status');
    }
  },
};
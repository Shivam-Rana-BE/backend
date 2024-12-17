'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Kids');

    // 1. Add `account_status` column if it doesn't exist
    if (!tableInfo.account_status) {
      await queryInterface.addColumn('Kids', 'account_status', {
        type: Sequelize.ENUM('Active', 'Inactive', 'Suspended'),
        defaultValue: 'Active',
        allowNull: false,
      });
    }

    // 2. Migrate `status` data to `account_status` if `status` exists
    if (tableInfo.status) {
      await queryInterface.sequelize.query(`
        UPDATE "Kids"
        SET "account_status" = CASE 
          WHEN "status" = true THEN 'Active'
          ELSE 'Inactive'
        END
      `);

      // 3. Remove the `status` column if it exists
      await queryInterface.removeColumn('Kids', 'status');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Kids');

    // 1. Re-add `status` column if it doesn't exist
    if (!tableInfo.status) {
      await queryInterface.addColumn('Kids', 'status', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      });
    }

    // 2. Revert `account_status` data back to `status`
    if (tableInfo.account_status) {
      await queryInterface.sequelize.query(`
        UPDATE "Kids"
        SET "status" = CASE 
          WHEN "account_status" = 'Active' THEN true
          ELSE false
        END
      `);

      // 3. Remove the `account_status` column if it exists
      await queryInterface.removeColumn('Kids', 'account_status');
    }
  },
};

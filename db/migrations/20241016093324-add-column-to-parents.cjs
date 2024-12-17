'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add two new fields to the "Parents" table
    await queryInterface.addColumn('Parents', 'isProfileComplete', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Default to false initially
      comment: 'Indicates if the parent has completed their profile',
    });

    await queryInterface.addColumn('Parents', 'hasChildProfile', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Default to false initially
      comment: 'Indicates if the parent has created a kid profile',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the added fields when rolling back
    await queryInterface.removeColumn('Parents', 'isProfileComplete');
    await queryInterface.removeColumn('Parents', 'hasChildProfile');
  },
};

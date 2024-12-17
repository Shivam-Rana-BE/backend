'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('CenterTherapistLinks', 'is_approved');

    await queryInterface.addColumn('CenterTherapistLinks', 'status', {
      type: Sequelize.ENUM('pending', 'accepted', 'rejected'),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('CenterTherapistLinks', 'is_approved', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });

    await queryInterface.removeColumn('CenterTherapistLinks', 'status');
  },
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn('TherapistCenters', 'is_main_center', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      }),
      queryInterface.addColumn('TherapistCenters', 'address', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('TherapistCenters', 'operating_hours', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('TherapistCenters', 'establishment', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('TherapistCenters', 'services_offered', {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.removeColumn('TherapistCenters', 'is_main_center'),
      queryInterface.removeColumn('TherapistCenters', 'address'),
      queryInterface.removeColumn('TherapistCenters', 'operating_hours'),
      queryInterface.removeColumn('TherapistCenters', 'establishment'),
      queryInterface.removeColumn('TherapistCenters', 'services_offered'),
    ]);
  }
};

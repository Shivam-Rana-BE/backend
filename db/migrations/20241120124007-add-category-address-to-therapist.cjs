'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Therapists', 'category_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'TherapistCategories',
        key: 'id',
      },
      onDelete: 'SET NULL',
    });
    
    await queryInterface.addColumn('Therapists', 'address', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Therapists', 'category_id');
    await queryInterface.removeColumn('Therapists', 'address');
  },
};

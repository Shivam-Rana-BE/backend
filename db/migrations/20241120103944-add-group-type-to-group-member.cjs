'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('GroupMembers', 'group_type', {
      type: Sequelize.ENUM("direct", "group"),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('GroupMembers', 'group_type');
  }
}

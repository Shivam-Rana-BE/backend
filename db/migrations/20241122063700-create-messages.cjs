'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Messages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      group_id: {
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      message_type: {
        type: Sequelize.STRING
      },
      message: {
        type: Sequelize.STRING
      },
      delivered: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      seen: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      tagged_users: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      isDeleted: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Messages');
  }
};
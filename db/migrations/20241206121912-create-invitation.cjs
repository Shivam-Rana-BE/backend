'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_Invitations_type" AS ENUM ('Therapist', 'TherapyCenter');
    `);
    await queryInterface.createTable('Invitations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted'),
        allowNull: false,
      },
      invitation_link: {
        type: Sequelize.STRING
      },
      added_by_id: {
        type: Sequelize.INTEGER
      },
      added_by_type: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.ENUM('Therapist', 'TherapyCenter'),
        allowNull: false,
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
    await queryInterface.dropTable('Invitations');
  }
};
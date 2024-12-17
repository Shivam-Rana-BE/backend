'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.renameColumn('Therapists', 'medical_card_id', 'id_proof_type');

    await queryInterface.addColumn('Therapists', 'id_proof_number', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.removeColumn('Therapists', 'id_proof_number');


    await queryInterface.renameColumn('Therapists', 'id_proof_type', 'medical_card_id');
  }
};

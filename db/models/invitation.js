'use strict';
import { Model } from 'sequelize';
import { invitation_status, user_type } from '../../utils/constant.js';
export default (sequelize, DataTypes) => {
  class Invitation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Invitation.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted"),
      allowNull: false,
      defaultValue: invitation_status.Pending
    },
    invitation_link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    added_by_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    added_by_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('Therapist', 'TherapyCenter'),
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Invitation',
  });
  return Invitation;
};
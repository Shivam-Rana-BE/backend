'use strict';
import { Model } from 'sequelize';
import { account_status, user_type } from '../../utils/constant.js';
export default (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Messages, { foreignKey: 'user_id', as: 'messages' });
      User.hasOne(models.Parent, { foreignKey: 'user_id', as: 'parent' });
      User.hasOne(models.Therapist, { foreignKey: 'user_id', as: 'therapist' });
      User.hasOne(models.TherapistCenter, { foreignKey: 'user_id', as: 'therapistCenter' });
      User.hasMany(models.GroupMember, { foreignKey: 'user_id', as: 'groupMembers' });
    }
  }
  User.init({
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
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_type: {
      type: DataTypes.ENUM('Parent', 'Therapist', 'TherapyCenter'),
      allowNull: false,
    },
    socket_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_online: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    account_status: {
      type: DataTypes.ENUM(account_status.Active, account_status.Inactive, account_status.Suspended),
      allowNull: true,
      defaultValue: account_status.Active,
    },
    reset_password_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_password_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
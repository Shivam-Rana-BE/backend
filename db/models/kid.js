'use strict';
import { Model } from 'sequelize';
import { account_status, gender, generateUid } from '../../utils/constant.js';
export default (sequelize, DataTypes) => {
  class Kid extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Kid.belongsTo(models.Parent, { foreignKey: 'parent_id', as: 'parent' });
      Kid.hasMany(models.Attachment, { foreignKey: 'kid_id', as: 'attachments' });
      Kid.hasMany(models.KidMilestone, { foreignKey: 'kid_id', as: 'milestones' });
    }
  }
  Kid.init({
    uuid: {
      type: DataTypes.STRING,
      defaultValue: () => generateUid(),
      allowNull: false,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Parents',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    diagnosis: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date_of_birth: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM(gender.male, gender.female),
      // allowNull: true,
      defaultValue: gender.male,
    },
    account_status: {
      type: DataTypes.ENUM(account_status.Active, account_status.Inactive, account_status.Suspended),
      allowNull: true,
      defaultValue: account_status.Active,
    },
    profile_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'Kid',
  });
  return Kid;
};
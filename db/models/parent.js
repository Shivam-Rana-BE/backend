'use strict';
import { Model } from 'sequelize';
import { generateUid, language } from '../../utils/constant.js';

export default (sequelize, DataTypes) => {
  class Parent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Parent.hasMany(models.Kid, { foreignKey: 'parent_id', as: 'children', });
      Parent.hasMany(models.Attachment, { foreignKey: 'parent_id', as: 'attachments' });
      Parent.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }
  Parent.init({
    uuid: {
      type: DataTypes.STRING,
      defaultValue: () => generateUid(),
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    language: {
      type: DataTypes.ENUM(language.English),
      allowNull: true,
      defaultValue: language.English,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isProfileComplete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    hasChildProfile: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
      onUpdate: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'Parent',
  });

  return Parent;
};
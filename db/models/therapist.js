'use strict';
import { Model } from 'sequelize';
import { generateUid } from '../../utils/constant.js';

export default (sequelize, DataTypes) => {
  class Therapist extends Model {
    static associate(models) {
      Therapist.hasMany(models.CenterTherapistLink, { foreignKey: 'therapist_id', as: 'therapistLinks', });
      Therapist.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      Therapist.belongsTo(models.TherapistCategory, { foreignKey: 'category_id', as: 'category' });
    }
  }

  Therapist.init({
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
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    degree: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    experience: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    RCINo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_proof_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_proof_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    linkedin_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expertise: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    category_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'TherapistCategories',
        key: 'id',
      },
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_profile_complete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    profile_image: {
      type: DataTypes.STRING,
      allowNull: true,
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
    modelName: 'Therapist',
  });

  return Therapist;
};

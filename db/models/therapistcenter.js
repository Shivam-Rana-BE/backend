'use strict';
import {
  Model
} from 'sequelize';
import { generateUid } from '../../utils/constant.js';
export default (sequelize, DataTypes) => {
  class TherapistCenter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      TherapistCenter.belongsTo(models.TherapistCenter, { foreignKey: 'master_center_id', as: 'masterCenter', });
      TherapistCenter.hasMany(models.TherapistCenter, { foreignKey: 'master_center_id', as: 'subCenters', });
      TherapistCenter.hasMany(models.CenterTherapistLink, { foreignKey: 'center_id', as: 'therapistLinks', });
      TherapistCenter.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }
  TherapistCenter.init({
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
    is_main_center: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    master_center_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'TherapistCenter',
        key: 'id',
      },
    },
    therapy_center_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    brand_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_same_legal_name: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contact_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    services_offered: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    operating_hours: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    establishment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_profile_complete: {
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
  }, {
    sequelize,
    modelName: 'TherapistCenter',
  });
  return TherapistCenter;
};
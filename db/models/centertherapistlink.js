'use strict';
import { Model } from 'sequelize';
import { invitation_status, user_type } from '../../utils/constant.js';
export default (sequelize, DataTypes) => {
  class CenterTherapistLink extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CenterTherapistLink.belongsTo(models.TherapistCenter, { foreignKey: 'center_id', as: 'center', });
      CenterTherapistLink.belongsTo(models.Therapist, { foreignKey: 'therapist_id', as: 'therapist', });
    }
  }
  CenterTherapistLink.init({
    center_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'TherapistCenter',
        key: 'id',
      },
    },
    therapist_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Therapist',
        key: 'id',
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected"),
      allowNull: false,
      defaultValue: invitation_status.Pending
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'CenterTherapistLink',
  });
  return CenterTherapistLink;
};
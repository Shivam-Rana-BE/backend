'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class TherapistCategory extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  TherapistCategory.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        // unique: true,  
        allowNull: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'TherapistCategory',
      timestamps: true,
    }
  );

  return TherapistCategory;
};

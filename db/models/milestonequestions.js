'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class MilestoneQuestions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      MilestoneQuestions.hasMany(models.KidMilestone, {
        foreignKey: 'question_id',
        as: 'kidMilestones',
      });
    }
  }
  MilestoneQuestions.init({
    question: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    que_icon: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    added_by: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Admin',
        key: 'id',
      },
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
    modelName: 'MilestoneQuestions',
  });
  return MilestoneQuestions;
};

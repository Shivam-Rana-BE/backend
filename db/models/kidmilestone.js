'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class KidMilestone extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      KidMilestone.belongsTo(models.Kid, { foreignKey: 'kid_id', as: 'kid' });
      KidMilestone.belongsTo(models.Parent, { foreignKey: 'parent_id', as: 'parent' });
      KidMilestone.belongsTo(models.MilestoneQuestions, { foreignKey: 'question_id', as: 'question' });
    }
  }
  KidMilestone.init({
    parent_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Parent',
        key: 'id',
      },
    },
    question_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'MilestoneQuestions',
        key: 'id',
      },
    },
    kid_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Kid',
        key: 'id',
      },
    },
    answer: {
      type: DataTypes.BOOLEAN,
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
    modelName: 'KidMilestone',
  });
  return KidMilestone;
};
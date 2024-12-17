'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Attachment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Attachment.belongsTo(models.Parent, { foreignKey: 'parent_id', as: 'parent' });
      Attachment.belongsTo(models.Kid, { foreignKey: 'kid_id', as: 'kid' });
    }
  }
  Attachment.init({
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    kid_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    file_type: {
      type: DataTypes.STRING,
    },
    file_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Attachment',
  });
  return Attachment;
};
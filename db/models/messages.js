'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Messages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Messages.belongsTo(models.User, { foreignKey: 'user_id', as: 'sender', });
      Messages.belongsTo(models.Groups, { foreignKey: 'group_id', as: 'group' });
      Messages.hasMany(models.MessageAttachments, { foreignKey: 'message_id', as: 'attachments' });
    }
  }
  Messages.init({
    group_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Groups',
        key: 'id',
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    message_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    delivered: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
    },
    delivery_queue: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
    },
    seen: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
    },
    tagged_users: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'Messages',
  });
  return Messages;
};
'use strict';
import { Model } from 'sequelize';
import { chat_type } from '../../utils/constant.js';
export default (sequelize, DataTypes) => {
  class Groups extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Groups.hasMany(models.GroupMember, { foreignKey: 'group_id', as: 'groupMembers' });
      Groups.hasMany(models.Messages, { foreignKey: 'group_id', as: 'messages' });
    }
  }
  Groups.init({
    group_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    group_icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_message: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_message_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Messages',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM(chat_type.Direct, chat_type.Group),
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'Groups',
  });
  return Groups;
};
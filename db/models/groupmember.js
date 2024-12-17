'use strict';
import { Model } from 'sequelize';
import { chat_type } from '../../utils/constant.js';
export default (sequelize, DataTypes) => {
  class GroupMember extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      GroupMember.belongsTo(models.Groups, { foreignKey: 'group_id', as: 'group' });
      GroupMember.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }
  GroupMember.init({
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
    group_type: {
      type: DataTypes.ENUM(chat_type.Direct, chat_type.Group),
      allowNull: false,
    },
    unread_counts: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'GroupMember',
  });
  return GroupMember;
};
'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class SiteSetting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SiteSetting.init({
    about: DataTypes.TEXT,
    privacy_security: DataTypes.TEXT,
    help_support: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'SiteSetting',
  });
  return SiteSetting;
};
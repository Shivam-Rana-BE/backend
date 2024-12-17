import sequelizeDAO from '../DAO/sequelizeDAO.js';
import { modelName } from '../utils/constant.js';
import db from '../db/models/index.js';

const create_therapist_category = async (payload) => {
  try {
    return await sequelizeDAO.createData(modelName.THERAPIST_CATEGORY, payload);
  } catch (error) {
    throw error;
  }
};

const get_all_therapist_categories = async (query = {}) => {
  try {
    return await sequelizeDAO.getData(modelName.THERAPIST_CATEGORY, query);
  } catch (error) {
    throw error;
  }
};

const check_category = async (query) => {
  try {
    return await sequelizeDAO.getOneData(modelName.THERAPIST_CATEGORY, query);
  } catch (error) {
    throw error;
  }
};

const get_therapist_category_by_id = async (id) => {
  try {
    return await sequelizeDAO.getOneData(modelName.THERAPIST_CATEGORY, { id });
  } catch (error) {
    throw error;
  }
};

const update_therapist_category = async (id, updateData) => {
  try {
    return await sequelizeDAO.updateData(modelName.THERAPIST_CATEGORY, { id }, updateData);
  } catch (error) {
    throw error;
  }
};

const delete_therapist_category = async (id) => {
  try {
    return await sequelizeDAO.updateData(modelName.THERAPIST_CATEGORY, { id }, { isDeleted: true });
  } catch (error) {
    throw error;
  }
};

const therapist_category_service = {
  create_therapist_category,
  get_all_therapist_categories,
  check_category,
  get_therapist_category_by_id,
  update_therapist_category,
  delete_therapist_category,
};

export default therapist_category_service;

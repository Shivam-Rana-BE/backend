import sequelizeDAO from '../DAO/sequelizeDAO.js';
import { modelName } from '../utils/constant.js';
import tokenManager from "../lib/token_manager.js";
import { Op } from 'sequelize';
import db from '../db/models/index.js';

const buildQuery = (fields = {}, operators = {}, defaults = {}) => {
    const query = { ...defaults };

    for (const [key, value] of Object.entries(fields)) {
        if (operators[key]) {
            query[key] = { [operators[key]]: value };
        } else {
            query[key] = value;
        }
    }

    return query;
};

const check_parent_exists = async (query) => {
    try {
        return await sequelizeDAO.getOneData(modelName.PARENT, query);
    } catch (error) {
        throw error;
    }
}

const create_parent = async (payload) => {
    try {
        return await sequelizeDAO.createData(modelName.PARENT, payload);
    } catch (error) {
        throw error;
    }
}

const create_parent_token = async (payload) => {
    try {
        return tokenManager.create_token(payload);
    } catch (error) {
        throw error;
    }
};

const get_single_parent = async (query, attributes = {}) => {
    try {
        return await sequelizeDAO.getOneData(modelName.PARENT, query, attributes);
    } catch (error) {
        throw error;
    }
}

const update_parent = async (query, payload) => {
    try {
        return await sequelizeDAO.updateData(modelName.PARENT, query, payload);
    } catch (error) {
        throw error;
    }
}

const create_child = async (payload) => {
    try {
        return await sequelizeDAO.createData(modelName.KID, payload);
    } catch (error) {
        throw error;
    }
}

const check_other_parent_exists = async (parentId, fields) => {
    try {
        const query = buildQuery(fields, { id: Op.ne }, { isDeleted: false });
        if (parentId) query.id = { [Op.ne]: parentId };

        const parent = await sequelizeDAO.getOneData(modelName.PARENT, query);
        return parent;
    } catch (error) {
        throw error;
    }
};

const get_child_list = async (query) => {
    try {

        const attributes = ['id', 'name', 'diagnosis', 'date_of_birth', 'gender', 'account_status', 'createdAt', "profile_image", "uuid"];

        const include = [
            {
                model: db.Attachment,
                as: 'attachments',
                attributes: ['id', 'file_type', 'file_url'],
            },
        ];
        const order = [['createdAt', "DESC"]]

        return await sequelizeDAO.getDataWithRelations(modelName.KID, query, { attributes, include, order });
    } catch (error) {
        throw error;
    }
}

const parentService = {
    check_parent_exists,
    create_parent,
    create_parent_token,
    create_child,
    get_single_parent,
    update_parent,
    check_other_parent_exists,
    get_child_list,
};

export default parentService;
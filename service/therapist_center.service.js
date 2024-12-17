import sequelizeDAO from '../DAO/sequelizeDAO.js';
import { modelName } from '../utils/constant.js';
import tokenManager from "../lib/token_manager.js";
import db from '../db/models/index.js';
import { Op } from 'sequelize';

const check_therapist_center = async (query) => {
    try {
        return await sequelizeDAO.getOneData(modelName.THERAPIST_CENTER, query);
    } catch (error) {
        throw error;
    }
}

const create_therapist_center = async (payload) => {
    try {
        return await sequelizeDAO.createData(modelName.THERAPIST_CENTER, payload);
    } catch (error) {
        throw error;
    }
}

const create_therapist_center_token = async (payload) => {
    try {
        return tokenManager.create_token(payload);
    } catch (error) {
        throw error;
    }
};

const check_center_therapist_link = async (query) => {
    try {
        return await sequelizeDAO.getOneData(modelName.CENTER_THERAPIST_LINK, query);
    } catch (error) {
        throw error;
    }
}

const create_center_therapist_link = async (payload) => {
    try {
        return await sequelizeDAO.createData(modelName.CENTER_THERAPIST_LINK, payload);
    } catch (error) {
        throw error;
    }
}

const get_link_therapists = async (where, reqQuery) => {
    try {
        let { limit, page, search } = reqQuery

        let query = where
        if (search) {
            query = {
                ...query,
                [Op.or]: [
                    { "$therapist.name$": { [Op.iLike]: `%${search}%` } },
                    { "$therapist.email$": { [Op.iLike]: `%${search}%` } },
                ],
            };
        }
        let option = {
            page: page || 1,
            limit: limit || 10,
            order: [["createdAt", 'DESC']],
            include: [
                {
                    model: db.Therapist,
                    as: 'therapist',
                    where: { isDeleted: false },
                    required: false,
                    attributes: ['id', 'uuid', 'name', 'email', 'degree', 'experience', 'RCINo', 'id_proof_type', 'id_proof_number', 'linkedin_url', 'expertise', 'createdAt'],

                }
            ],
            attributes: ['id', 'is_active', 'createdAt'],
        }
        return await sequelizeDAO.getDataWithPagination(modelName.CENTER_THERAPIST_LINK, query, option);
    } catch (error) {
        throw error;
    }
}


const update_center_therapist_link = async (query, updateData) => {
    try {
        return await sequelizeDAO.updateData(modelName.CENTER_THERAPIST_LINK, query, updateData);
    } catch (error) {
        throw error;
    }
}

const update_therapy_center = async (query, payload) => {
    try {
        return await sequelizeDAO.updateData(modelName.THERAPIST_CENTER, query, payload);
    } catch (error) {
        throw error;
    }
}
const get_therapy_centerProfile = async (userId) => {
    const options = {
        include: [
            {
                model: db.TherapistCenter,
                as: 'therapistCenter',
                attributes: { exclude: ['password', 'updatedAt', 'isDeleted', 'createdAt'] }
            }
        ],
        attributes: { exclude: ['password', 'updatedAt', 'isDeleted', 'reset_password_code', 'socket_id', 'reset_password_expires', 'createdAt'] }
    };

    return await sequelizeDAO.getOneData(modelName.USER, { id: userId }, options);
};

const get_therapist_details = async (therapist_id) => {
    const options = {
        attributes: { exclude: ['password', 'updatedAt','createdAt'] },
        include: [
            {
                model: db.TherapistCategory,
                as: 'category',
                attributes: ['id', 'name']
            },
            {
                model: db.User,
                as: 'user',
                attributes: ['account_status']
            }
        ],
    };
    const therapist = await sequelizeDAO.getOneData(modelName.THERAPIST, { id: therapist_id, isDeleted: false }, options);
    return therapist;
};


const therapyCenterService = {
    check_therapist_center,
    create_therapist_center,
    create_therapist_center_token,
    check_center_therapist_link,
    create_center_therapist_link,
    get_link_therapists,
    update_center_therapist_link,
    update_therapy_center,
    get_therapy_centerProfile,
    get_therapist_details

}

export default therapyCenterService;
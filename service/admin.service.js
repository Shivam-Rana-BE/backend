import sequelizeDAO from '../DAO/sequelizeDAO.js';
import { modelName, msg, user_type } from '../utils/constant.js';
import tokenManager from "../lib/token_manager.js";
import { Op } from 'sequelize';
import db from '../db/models/index.js';


const check_admin = async (query) => {
    try {
        return await sequelizeDAO.getOneData(modelName.ADMIN, query);
    } catch (error) {
        throw error;
    }
}

const create_admin_token = async (payload) => {
    try {
        return tokenManager.create_token(payload);
    } catch (error) {
        throw error;
    }
};

const check_milestone_question = async (query) => {
    try {
        return await sequelizeDAO.getOneData(modelName.MILESTONE_QUESTION, { ...query, isDeleted: false });
    } catch (error) {
        throw error;
    }
}

const create_milestone_que = async (payload) => {
    try {
        return await sequelizeDAO.createData(modelName.MILESTONE_QUESTION, payload);
    } catch (error) {
        throw error;
    }
}
const get_milestone_que = async (payload, reqQuery) => {
    try {
        let option = {
            page: reqQuery.page || 1,
            limit: reqQuery.limit || 10,
            order: [["createdAt", 'ASC']],
            attributes: ['id', 'question', 'que_icon', 'createdAt']
        }
        return await sequelizeDAO.getDataWithPagination(modelName.MILESTONE_QUESTION, payload, option);
    } catch (error) {
        throw error;
    }
}

const update_milestone = async (query, payload) => {
    try {
        return await sequelizeDAO.updateData(modelName.MILESTONE_QUESTION, query, payload);
    } catch (error) {
        throw error;
    }
}

const fetch_therapist_center = async (reqQuery) => {
    try {
        let { limit, page, search } = reqQuery

        let query = { isDeleted: false, user_type: user_type.TherapyCenter }
        if (search) {
            query = {
                ...query,
                [Op.or]: [
                    { '$therapistCenter.therapy_center_name$': { [Op.iLike]: `%${search}%` } },
                    { '$therapistCenter.brand_name$': { [Op.iLike]: `%${search}%` } },
                    { '$therapistCenter.email$': { [Op.iLike]: `%${search}%` } },
                    { '$therapistCenter.contact_number$': { [Op.iLike]: `%${search}%` } }
                ]
            };
        }
        let option = {
            page: page || 1,
            limit: limit || 10,
            order: [["createdAt", 'DESC']],
            include: [
                {
                    model: db.TherapistCenter,
                    as: 'therapistCenter',
                    // where: { isDeleted: false },
                    required: true,
                    attributes: ['uuid', 'therapy_center_name', 'brand_name', 'is_same_legal_name', 'email', 'contact_number', 'website', 'createdAt', 'is_profile_complete', 'is_available', 'profile_image'],
                }
            ],
            attributes: ['id', 'account_status'],
        }
        return await sequelizeDAO.getDataWithPagination(modelName.USER, query, option);
    } catch (error) {
        throw error;
    }
}

const fetchParents = async (reqQuery) => {
    try {
        let { limit, page, search } = reqQuery;

        let query = { isDeleted: false };

        if (search) {
            query = {
                ...query,
                [Op.or]: [
                    { name: { [Op.iLike]: `%${search}%` } },
                    { email: { [Op.iLike]: `%${search}%` } },
                    { phone_number: { [Op.iLike]: `%${search}%` } }
                ]
            };
        }

        let options = {
            page: page || 1,
            limit: limit || 10,
            order: [["createdAt", "DESC"]],
            attributes: ["id", "uuid", "name", "email", "phone_number", "status", "hasChildProfile", "profile_image", "createdAt"]
        };

        return await sequelizeDAO.getDataWithPagination(modelName.PARENT, query, options);
    } catch (error) {
        throw error;
    }
};

const fetchKids = async (reqQuery) => {
    try {
        let { limit, page, search } = reqQuery;

        let query = { isDeleted: false };

        if (search) {
            query = {
                ...query,
                [Op.or]: [
                    { name: { [Op.iLike]: `%${search}%` } },
                    { "$parent.name$": { [Op.iLike]: `%${search}%` } }

                ]
            };
        }

        let options = {
            page: page || 1,
            limit: limit || 10,
            order: [["createdAt", "DESC"]],
            attributes: ["id", "uuid", "name", "diagnosis", 'date_of_birth', 'account_status'],
            include: [
                {
                    model: db.Parent,
                    as: 'parent',
                    where: { isDeleted: false },
                    required: false,
                    attributes: ['id', 'uuid', 'name', 'email', 'phone_number', 'profile_image', 'createdAt'],
                }
            ],
        };

        return await sequelizeDAO.getDataWithPagination(modelName.KID, query, options);
    } catch (error) {
        throw error;
    }
};

const create_invitation = async (payload) => {
    try {
        return await sequelizeDAO.createData(modelName.INVITATION, payload);
    } catch (error) {
        throw error;
    }
}

const update_invitation = async (match, payload) => {
    try {
        return await sequelizeDAO.updateData(modelName.INVITATION, match, payload);
    } catch (error) {
        throw error;
    }
}

const check_invitation = async (match) => {
    try {
        return await sequelizeDAO.getOneData(modelName.INVITATION, match);
    } catch (error) {
        throw error;
    }
}

const getInvitations = async ({ added_by_id, search, status, page, limit, }) => {
    try {
        const where = { added_by_id };

        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }
        if (status) where.status = status;
        const options = {
            page,
            limit,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'name', 'email', 'status', 'added_by_id', 'createdAt']
        };
        return await sequelizeDAO.getDataWithPagination(modelName.INVITATION, where, options);
    } catch (error) {
        throw error;
    }
};


const deleteInvitation = async (id, userId) => {
    try {
        const invitation = await sequelizeDAO.getOneData(modelName.INVITATION, { id });
        if (!invitation) {
            return { success: false, message: msg.invitationNotFound };
        }
        if (invitation.added_by_id !== userId) {
            return { success: false, message: msg.invitationDeleteUnauthorized };
        }
        await sequelizeDAO.deleteData(modelName.INVITATION, { id });
        return { success: true, message: msg.invitationDeleted };
    } catch (error) {
        throw error;
    }
};




const adminService = {
    check_admin,
    create_admin_token,
    check_milestone_question,
    create_milestone_que,
    get_milestone_que,
    update_milestone,
    fetch_therapist_center,
    fetchParents,
    fetchKids,
    create_invitation,
    check_invitation,
    getInvitations,
    deleteInvitation,
    update_invitation
}

export default adminService;
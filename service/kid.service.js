import sequelizeDAO from '../DAO/sequelizeDAO.js';
import { modelName } from '../utils/constant.js';
import { msg } from '../utils/constant.js';
import db from '../db/models/index.js';

const add_attachment = async (payload) => {
    try {
        return await sequelizeDAO.createData(modelName.ATTACHMENT, payload);
    } catch (error) {
        throw error;
    }
};

const get_attachment = async (query) => {
    try {
        return await sequelizeDAO.getOneData(modelName.ATTACHMENT, query);
    } catch (error) {
        throw error;
    }
}

const delete_attachment = async (payload) => {
    try {
        return await sequelizeDAO.deleteData(modelName.ATTACHMENT, payload);
    } catch (error) {
        throw error;
    }
};


const set_kid_status = async (kid, status) => {
    try {
        await sequelizeDAO.updateData(modelName.KID, { id: kid.id }, { account_status: status });
        kid.account_status = status;
        return kid;
    } catch (error) {
        throw new Error(`${msg.status_update_failure}: ${error.message}`);
    }
};

const get_kid_by_id = async (id, attributes = {}) => {
    try {
        const kidId = parseInt(id, 10);
        if (isNaN(kidId)) {
            throw new Error(msg.invalid_id_format);
        }
        return await sequelizeDAO.getOneData(modelName.KID, { id: kidId, isDeleted: false }, attributes);
    } catch (error) {
        throw error;
    }
};

const child_exists = async (query) => {
    try {
        return await sequelizeDAO.getOneData(modelName.KID, query);
    } catch (error) {
        throw error;
    }
};

const update_child = async (query, payload) => {
    try {
        return await sequelizeDAO.updateData(modelName.KID, query, payload);
    } catch (error) {
        throw error;
    }
};

const kid_milestone_check = async (query) => {
    try {
        return await sequelizeDAO.getOneData(modelName.KID_MILESTONE, query);
    } catch (error) {
        throw error;
    }
};
const store_kid_milestone = async (payload) => {
    try {
        return await sequelizeDAO.createData(modelName.KID_MILESTONE, payload);
    } catch (error) {
        throw error;
    }
};

const fetch_submitted_questions = async (query) => {
    try {
        const options = {
            include: [
                {
                    model: db.MilestoneQuestions,
                    as: 'question',
                    attributes: ['id', 'question', 'que_icon'],
                },
            ],
            attributes: ['id', 'kid_id', 'answer', 'createdAt'],
            order: [["createdAt", "DESC"]]
        }

        return await sequelizeDAO.getDataWithRelations(modelName.KID_MILESTONE, query, options);
    } catch (error) {
        throw error;
    }
};

const fetch_pending_questions = async (query) => {
    try {
        const options = {
            attributes: ['id', 'question', 'que_icon'],
            order: [["createdAt", "ASC"]]
        }
        const data = await sequelizeDAO.getDataWithRelations(modelName.MILESTONE_QUESTION, query, options);
        const totalCount = await sequelizeDAO.getTotalCount(modelName.MILESTONE_QUESTION, { isDeleted: false })
        return { data, totalCount }
    } catch (error) {
        throw error;
    }
};

const kidService = {
    add_attachment,
    get_attachment,
    delete_attachment,
    get_kid_by_id,
    set_kid_status,
    child_exists,
    update_child,
    kid_milestone_check,
    store_kid_milestone,
    fetch_submitted_questions,
    fetch_pending_questions
};

export default kidService;

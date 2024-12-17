import sequelizeDAO from '../DAO/sequelizeDAO.js';
import { invitation_status, modelName } from '../utils/constant.js';
import tokenManager from "../lib/token_manager.js";
import db from '../db/models/index.js';

const check_therapist = async (payload, options = {}) => {
    try {
        return await sequelizeDAO.getOneData(modelName.THERAPIST, payload, options);
    } catch (error) {
        throw error;
    }
};

const fetch_therapist_profile = async (query) => {
    try {
        const include = [
            {
                model: db.CenterTherapistLink,
                as: 'therapistLinks',
                where: {
                    status: invitation_status.Pending,
                },
                required: false,
                attributes: ['is_active', 'status', 'createdAt', 'id'],
                include: [
                    {
                        model: db.TherapistCenter,
                        as: 'center',
                        attributes: [
                            'uuid',
                            'therapy_center_name',
                            'brand_name',
                            'email',
                            'contact_number',
                            'website',
                            'profile_image',
                            'is_available',
                            'createdAt'
                        ],
                    }
                ],
            }
        ];

        const options = {
            attributes: ['id', 'uuid', 'user_id', 'name', 'email', 'degree', 'experience', 'RCINo', 'id_proof_type', 'id_proof_number', 'linkedin_url', 'expertise', 'category_id', 'address', 'is_profile_complete', 'profile_image', 'createdAt']
        }
        return await sequelizeDAO.getOneWithRelations(modelName.THERAPIST, query, include, options);
    } catch (error) {
        throw error;
    }
};


const create_therapist = async (payload) => {
    try {
        return await sequelizeDAO.createData(modelName.THERAPIST, payload);
    } catch (error) {
        throw error;
    }
}

const create_therapist_token = async (payload) => {
    try {
        return tokenManager.create_token(payload);
    } catch (error) {
        throw error;
    }
};

const get_therapist_by_filter = async (payload) => {
    try {
        const options = {
            page: payload.page || 1,
            limit: payload.limit || 10,
            order: [["createdAt", 'DESC']],
            attributes: ['id', 'name', 'address', 'profile_image', 'user_id'],
            include: [
                {
                    model: db.TherapistCategory,
                    as: 'category',
                    attributes: ['name', 'id']
                },
                {
                    model: db.User,
                    as: 'user',
                    attributes: ['is_online']
                }
            ]
        };
        const { page, limit, ...criteria } = payload;
        console.log("🚀 ~ constget_therapist_by_filter= ~ payload:", criteria)

        return await sequelizeDAO.getDataWithPagination(modelName.THERAPIST, criteria, options);
    } catch (error) {
        throw error;
    }
};


const update_therapist = async (query, payload) => {
    try {
        return await sequelizeDAO.updateData(modelName.THERAPIST, query, payload);
    } catch (error) {
        throw error;
    }
}

const fetch_pending_invitations = async (payload, options = {}) => {
    try {
        return await sequelizeDAO.getData(modelName.INVITATION, payload, options);
    } catch (error) {
        throw error;
    }
};

const create_center_link_payload = async (data, therapistId) => {
    const payload = data.map(val => ({
        center_id: val.added_by_id,
        therapist_id: therapistId
    }));
    return await sequelizeDAO.bulkCreateData(modelName.CENTER_THERAPIST_LINK, payload);
};

const check_invitation = async (query) => {
    return await sequelizeDAO.getOneData(modelName.CENTER_THERAPIST_LINK, query);
};

const update_invitation = async (query, dataToSet) => {

    return await sequelizeDAO.updateData(modelName.CENTER_THERAPIST_LINK, query, dataToSet);
};

const therapistService = {
    check_therapist,
    fetch_therapist_profile,
    create_therapist,
    create_therapist_token,
    get_therapist_by_filter,
    update_therapist,
    fetch_pending_invitations,
    create_center_link_payload,
    check_invitation,
    update_invitation
}

export default therapistService;
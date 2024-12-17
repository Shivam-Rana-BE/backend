import sequelizeDAO from '../DAO/sequelizeDAO.js';
import { modelName } from '../utils/constant.js';


const check_user_exists = async (query) => {
    try {
        return await sequelizeDAO.getOneData(modelName.USER, { ...query, isDeleted: false });
    } catch (error) {
        throw error;
    }
}

const create_user = async (payload) => {
    try {
        return await sequelizeDAO.createData(modelName.USER, payload);
    } catch (error) {
        throw error;
    }
}


const update_user = async (query, payload) => {
    try {
        return await sequelizeDAO.updateData(modelName.USER, query, payload);
    } catch (error) {
        throw error;
    }
}


const userService = {
    check_user_exists,
    create_user,
    update_user
};

export default userService;
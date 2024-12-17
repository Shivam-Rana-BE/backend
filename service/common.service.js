import sequelizeDAO from '../DAO/sequelizeDAO.js';
import { modelName } from '../utils/constant.js';
import { notificationSettings } from '../utils/notification.js';


const manage_site_setting = async (payload) => {
    try {
        return await sequelizeDAO.createOrUpdateData(modelName.SITE_SETTING, payload, {})
    } catch (error) {
        throw error;
    }
};

const fetch_site_setting = async () => {
    try {
        return await sequelizeDAO.getOneData(modelName.SITE_SETTING)
    } catch (error) {
        throw error;
    }
};

const checkNotification = async (setting) => {
    return notificationSettings[setting]
}
const commonService = {
    manage_site_setting,
    fetch_site_setting,
    checkNotification
};

export default commonService;

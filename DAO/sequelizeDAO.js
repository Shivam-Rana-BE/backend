import db from '../db/models/index.js';

const getOneData = async (modelName, criteria, options = {}) => {
    return await db[modelName].findOne({ where: criteria, ...options });
};

const getData = async (modelName, criteria, options = {}) => {
    return await db[modelName].findAll({ where: criteria, ...options });
};

const createData = async (modelName, data) => {
    return await db[modelName].create(data);
};
const bulkCreateData = async (modelName, data) => {
    return await db[modelName].bulkCreate(data);
};

const updateData = async (modelName, criteria, dataToSet) => {
    return await db[modelName].update(dataToSet, { where: criteria });
};

const deleteData = async (modelName, criteria) => {
    return await db[modelName].destroy({ where: criteria });
};

const getDataBySelect = async (modelName, criteria, selectionBased) => {
    return await db[modelName].findAll({
        where: criteria,
        attributes: selectionBased,
    });
};

const getOnePopulateData = async (modelName, criteria, include) => {
    return await db[modelName].findOne({
        where: criteria,
        include,
    });
};

const getOneWithRelations = async (modelName, criteria, include = [], options = {}) => {
    try {
        return await db[modelName].findOne({
            where: criteria,
            include,
            ...options,
        });
    } catch (error) {
        console.error(`Error fetching ${modelName} with include:`, error);
        throw error;
    }
};

const getDataWithRelations = async (modelName, query = {}, options = {}) => {
    try {
        const {
            include = [],
            order = [],
            attributes,
        } = options;

        // Execute the query with the provided options
        return await db[modelName].findAll({
            where: query,
            include,
            order,
            attributes
        });
    } catch (error) {
        throw error;
    }
};

const getDataWithPagination = async (modelName, criteria, { page = 1, limit = 10, ...options } = {}) => {
    try {
        // validateModel(modelName);
        const offset = (page - 1) * limit;
        const result = await db[modelName].findAndCountAll({
            where: criteria,
            limit,
            offset,
            ...options,
            distinct: true
        });

        return {
            data: result.rows,
            totalCount: result.count,
            totalPages: Math.ceil(result.count / limit),
            currentPage: parseInt(page),
        };
    } catch (error) {
        console.error(`Error fetching paginated data for ${modelName}:`, error);
        throw error;
    }
};

const createOrUpdateData = async (modelName, dataToSet, criteria) => {
    try {
        const existingRecord = await db[modelName].findOne({ where: criteria });

        if (existingRecord) {
            return await db[modelName].update(dataToSet, { where: criteria });
        } else {
            return await db[modelName].create(dataToSet);
        }
    } catch (error) {
        console.error('Error creating or updating data:', error);
        throw error;
    }
};

const getTotalCount = async (modelName, where = {}) => {
    try {
        return await db[modelName].count({ where });
    } catch (error) {
        console.error(`Error counting records for model ${modelName}:`, error);
        throw error;
    }
};


export default {
    getOneData,
    getData,
    createData,
    bulkCreateData,
    updateData,
    deleteData,
    getDataBySelect,
    getOnePopulateData,
    getOneWithRelations,
    getDataWithPagination,
    getDataWithRelations,
    createOrUpdateData,
    getTotalCount
};

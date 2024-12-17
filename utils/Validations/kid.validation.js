import Joi from 'joi';
import { account_status } from '../constant.js';

const statusValidator = Joi.object({
    id: Joi.number().integer().required().messages({
        "number.base": "ID must be a number",
        "number.integer": "ID must be an integer",
        "*": "ID is required"
    }),
    status: Joi.string()
        .valid(...Object.values(account_status))
        .required()
        .messages({
            "any.only": `Status must be one of: ${Object.values(account_status).join(', ')}`,
            "*": "Status is required"
        }),
});

const updateKidValidator = Joi.object({
    kidId: Joi.string().required().messages({
        "*": "kidId is required"
    }),
    name: Joi.string().required().messages({
        "*": "name is required"
    }),
    date_of_birth: Joi.string().required().messages({
        "*": "date of birth is required"
    }),
    diagnosis: Joi.string().optional().allow(""),
    removeAttachments: Joi.any().optional(),
    attachments: Joi.array()
        .items(Joi.object({
            originalname: Joi.string().required(),
            mimetype: Joi.string().valid('image/jpeg', 'image/png', 'application/pdf').required(),
            size: Joi.number().max(5 * 1024 * 1024) // Max size 5MB
        }))
        .optional(),
});

const submitMilestoneValidator = Joi.object({
    kidId: Joi.number().required().messages({
        "*": "kid id is required"
    }),
    questionId: Joi.number().required().messages({
        "*": "Question id is required"
    }),
    answer: Joi.boolean().required().messages({
        "*": "Answer is required"
    }),
});

export { statusValidator, updateKidValidator, submitMilestoneValidator };

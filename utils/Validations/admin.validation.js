import Joi from 'joi';
import { account_status } from '../constant.js';

const addQuestionValidator = Joi.object({
    question: Joi.string().required().messages({
        "*": "Question is required"
    }),
});
const updateQuestionValidator = Joi.object({
    questionId: Joi.string().required().messages({
        "*": "Question id is required"
    }),
    question: Joi.string().required().messages({
        "*": "Question is required"
    }),
});

const inviteTherapyCenterValidator = Joi.object({
    name: Joi.string().required().messages({
        '*': 'name is required'
    }),
    email: Joi.string().required().messages({
        '*': 'email is required'
    })
});


const changeUserStatusValidator = Joi.object({
    userId: Joi.number().required().messages({
        "*": "userId is required"
    }),
    status: Joi.string()
        .valid(...Object.values(account_status))
        .required()
        .messages({
            "any.only": `Status must be one of: ${Object.values(account_status).join(', ')}`,
            "*": "Status is required"
        }),
});

const manageAvailabilityValidator = Joi.object({
    userId: Joi.number().required().messages({
        "*": "userId is required"
    }),
    status: Joi.boolean().required().messages({
        "any.only": "Status must be either true or false",
        "any.required": "Status is required"
    }),
});


const updateCentreDetailsValidator = Joi.object({
    userId: Joi.number().required().messages({
        "*": "userId is required"
    }),
    therapy_center_name: Joi.string().optional(),
    brand_name: Joi.string().optional(),
    website: Joi.string().optional(),
});

export {
    addQuestionValidator,
    updateQuestionValidator,
    inviteTherapyCenterValidator,
    changeUserStatusValidator,
    manageAvailabilityValidator,
    updateCentreDetailsValidator
}
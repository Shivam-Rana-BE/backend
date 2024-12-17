import Joi from 'joi';
import { language } from '../constant.js';

const parentSignUpValidator = Joi.object({
    name: Joi.string().required().messages({
        "*": "name is required"
    }),
    email: Joi.string().email().required()
        .messages({
            "*": "enter valid email"
        }),
    password: Joi.string().required().messages({
        "*": "password is required"
    }),
    language: Joi.string().required().valid(language.English).messages({
        "*": `Only ${language.English} will accept`
    }),
    phone_number: Joi.string().optional(),
});

const addKidValidator = Joi.object({
    name: Joi.string().required().messages({
        "*": "name is required"
    }),
    date_of_birth: Joi.string().required().messages({
        "*": "date of birth is required"
    }),
    diagnosis: Joi.string().required().messages({
        "*": "concern is required"
    }),
    profile_image: Joi.any(),
    attachments: Joi.array()
        .items(Joi.object({
            originalname: Joi.string().required(),
            mimetype: Joi.string().valid('image/jpeg', 'image/png', 'application/pdf').required(),
            size: Joi.number().max(5 * 1024 * 1024) // Max size 5MB
        }))
        .optional(),
});

const updateProfileValidator = Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phone_number: Joi.string().optional(),
    profile_image: Joi.any().optional(),
});

const changePasswordValidator = Joi.object({
    oldPassword: Joi.string().required().messages({
        "*": "old password is required"
    }),
    newPassword: Joi.string().required().messages({
        "*": "new password is required"
    }),
});


export { parentSignUpValidator, addKidValidator, updateProfileValidator, changePasswordValidator }
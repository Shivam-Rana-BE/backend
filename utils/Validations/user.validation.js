import Joi from 'joi';
import { user_type } from '../constant.js';

const signUpValidator = Joi.object({
    username: Joi.string().required().messages({
        "*": "username is required"
    }),
    email: Joi.string().required().messages({
        "*": "email is required"
    }),
    password: Joi.string().required().messages({
        "*": "password is required"
    }),
    user_type: Joi.string().required().valid(user_type.Parent, user_type.Therapist, user_type.TherapyCenter),
    //     .messages({
    //     "*": "user type is required"
    // }),
    contact_number: Joi.string().optional(),
});

const signInValidator = Joi.object({
    email: Joi.string().required().messages({
        "*": "email is required"
    }),
    password: Joi.string().required().messages({
        "*": "password is required"
    }),
});

export{signUpValidator, signInValidator}
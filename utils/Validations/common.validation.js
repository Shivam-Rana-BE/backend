import Joi from 'joi';
import { user_type } from '../constant.js';

const signInValidator = Joi.object({
    email: Joi.string().required().messages({
        "*": "email is required"
    }),
    password: Joi.string().required().messages({
        "*": "password is required"
    }),
    role: Joi.string().required().valid(user_type.Parent, user_type.Therapist, user_type.TherapyCenter, user_type.Admin),
});

const forgotPasswordValidator = Joi.object({
    email: Joi.string().required().messages({
        "*": "email is required"
    }),
    role: Joi.string().required().valid(user_type.Parent, user_type.Therapist, user_type.TherapyCenter).messages({
        "*": "role is required"
    }),
});

const verifyOtpValidator = Joi.object({
    email: Joi.string().required().messages({
        "*": "email is required"
    }),
    code: Joi.string().required().messages({
        "*": "code is required"
    }),
    role: Joi.string().required().valid(user_type.Parent, user_type.Therapist, user_type.TherapyCenter).messages({
        "*": "role is required"
    }),
});

const siteSettingValidator = Joi.object({
    about: Joi.string().optional().allow(""),
    privacy_security: Joi.string().optional().allow(""),
    help_support: Joi.string().optional().allow(""),
});

const fetchInvitationsValidator = Joi.object({
    search: Joi.string().optional().allow(""),
    status: Joi.string().valid('pending', 'accepted').optional().messages({
        'any.only': 'Status must be either "pending" or "accepted"',
    }).allow(""),
    page: Joi.number().integer().optional().messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
    }),
    limit: Joi.number().integer().optional().messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be an integer',

    })
})
const updateInvitedCentreValidator = Joi.object({
    invitationId: Joi.number().required().messages({
        "*": "invitation id is required"
    }),
    name: Joi.string().optional(),
    email: Joi.string().optional(),
    type: Joi.string().required().valid(user_type.Therapist, user_type.TherapyCenter),
});

const resendInvitationValidator = Joi.object({
    email: Joi.string().required().messages({
        '*': 'email is required'
    }),
    type: Joi.string().required().valid(user_type.Therapist, user_type.TherapyCenter),
});

export {
    signInValidator,
    forgotPasswordValidator,
    verifyOtpValidator,
    siteSettingValidator,
    fetchInvitationsValidator,
    updateInvitedCentreValidator,
    resendInvitationValidator
}
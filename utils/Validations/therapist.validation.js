import Joi from 'joi';
import { invitation_status, language } from '../constant.js';

const therapistSignUpValidator = Joi.object({
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
    degree: Joi.string().required().messages({
        "*": "degree is required"
    }),
    experience: Joi.string().required().messages({
        "*": "experience is required"
    }),
    RCINo: Joi.string().required().messages({
        "*": "RCINo is required"
    }),
    id_proof_type: Joi.string().required().messages({
        "*": "Id proof type is required"
    }),
    id_proof_number: Joi.string().required().messages({
        "*": "Id proof number is required"
    }),
    linkedin_url: Joi.string().optional(),
    category_id: Joi.number().integer().required().messages({
        "*": "category_id is required"
    }),
    address: Joi.string().required().messages({
        "*": "address is required"
    }),
});

const loginViaInvitationValidator = Joi.object({
    invitationLink: Joi.string().required().messages({
        "*": "invitation link is required"
    }),
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
    degree: Joi.string().required().messages({
        "*": "degree is required"
    }),
    experience: Joi.string().required().messages({
        "*": "experience is required"
    }),
    RCINo: Joi.string().required().messages({
        "*": "RCINo is required"
    }),
    category_id: Joi.number().integer().required().messages({
        "*": "category_id is required"
    }),
    address: Joi.string().required().messages({
        "*": "address is required"
    }),
});

const manageInvitationValidator = Joi.object({
    therapistLinkedId: Joi.number().required().messages({
        "*": "therapistLinkedId is required"
    }),
    status: Joi.string().required().valid(invitation_status.Accepted, invitation_status.Rejected),
});
export {
    therapistSignUpValidator,
    loginViaInvitationValidator,
    manageInvitationValidator
};

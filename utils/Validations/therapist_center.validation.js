import Joi from 'joi';
import { language } from '../constant.js';

const therapistCenterSignUpValidator = Joi.object({
    therapy_center_name: Joi.string().required().messages({
        "*": "Therapy center name is required"
    }),
    brand_name: Joi.string().required().messages({
        "*": "Brand name is required"
    }),
    is_same_legal_name: Joi.boolean().required().messages({
        "*": "Legal name boolean value is required"
    }),
    email: Joi.string().email().required()
        .messages({
            "*": "enter valid email"
        }),
    password: Joi.string().required().messages({
        "*": "password is required"
    }),
    contact_number: Joi.string().required().messages({
        "*": "contact_number is required"
    }),
    website: Joi.string().required().messages({
        "*": "website is required"
    }),
});
const addSubCenterValidator = Joi.object({
    master_center_id: Joi.number().required().messages({
        "*": "Master center id is required"
    }),
    therapy_center_name: Joi.string().required().messages({
        "*": "Therapy center name is required"
    }),
    establishment: Joi.string().required().messages({
        "*": "establishment is required"
    }),
    services_offered: Joi.array().items(Joi.string()).required().messages({
        "*": "Services offered should be an array of strings"
    }),
    address: Joi.string().required().messages({
        "*": "address is required"
    }),
    contact_number: Joi.string().required().messages({
        "*": "contact number is required"
    }),
    email: Joi.string().email().required()
        .messages({
            "*": "enter valid email"
        }),
    operating_hours: Joi.string().optional().allow("")

});

const addTherapistValidator = Joi.object({
    name: Joi.string().required().messages({
        "*": "name is required"
    }),
    email: Joi.string().email().required()
        .messages({
            "*": "enter valid email"
        }),
    degree: Joi.string().optional().allow(""),
    experience: Joi.string().required().messages({
        "*": "experience is required"
    }),
    expertise: Joi.string().optional().allow(""),
    RCINo: Joi.string().optional().allow(""),
});

const manageTherapistStatusValidator = Joi.object({
    therapist_id: Joi.number().required(),
    is_active: Joi.boolean().required()
});

const loginViaInvitationValidator = Joi.object({
    email: Joi.string().email().required().messages({
        "*": "enter valid email"
    }),
    password: Joi.string().required().messages({
        "*": "password is required"
    }),
    invitationLink: Joi.string().required().messages({
        "*": "invitation link is required"
    })
});


const centerProfileUpdateValidator = Joi.object({
    therapy_center_name: Joi.string().required().messages({
        "*": "Therapy center name is required"
    }),
    brand_name: Joi.string().required().messages({
        "*": "Brand name is required"
    }),
    email: Joi.string().email().required()
        .messages({
            "*": "enter valid email"
        }),
    contact_number: Joi.string().required().messages({
        "*": "contact_number is required"
    }),
    website: Joi.string().required().messages({
        "*": "website is required"
    }),
    is_available: Joi.boolean().optional().messages({
        "*": "is_available must be boolean value"
    }),
});

const inviteTherapistValidator = Joi.object({
    name: Joi.string().required().messages({
        '*': 'name is required'
    }),
    email: Joi.string().required().messages({
        '*': 'email is required'
    })
});

export {
    therapistCenterSignUpValidator,
    addSubCenterValidator,
    addTherapistValidator,
    manageTherapistStatusValidator,
    loginViaInvitationValidator,
    centerProfileUpdateValidator,
    inviteTherapistValidator
}
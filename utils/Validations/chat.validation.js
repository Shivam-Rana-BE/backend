import Joi from 'joi';

const createTeamValidator = Joi.object({
    members: Joi.array().min(1).required().messages({
        "array.base": "Members should be an array.",
        "array.min": "At least one member is required in the team.",
        "any.required": "Members field is required."
    }),
    groupName: Joi.string().optional().allow("")
});

const searchGroupMembers = Joi.object({
    groupId: Joi.number().integer().required().messages({
        "number.base": "Group ID should be an integer.",
        "any.required": "Group ID is required."
    }),
    name: Joi.string().optional().allow("").messages({
        "string.base": "Name should be a string.",
    })
});


export { createTeamValidator, searchGroupMembers}
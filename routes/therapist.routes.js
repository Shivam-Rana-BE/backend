import express from "express";
const router = express.Router();
import { validateRequest, } from "../utils/Validations/index.js";
import { therapistValidator } from "../utils/Validations/index.js";
import { therapistController } from "../controller/index.js";
import j2s from "joi-to-swagger";
import { isAuthenticatedUser, isAuthorizedUser } from "../middleware/auth.middleware.js";
import { user_type } from "../utils/constant.js";

router.post("/signup",
    /*
        #swagger.tags = ['Therapist']
        #swagger.summary = 'therapist-signup'
        #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: { $ref: '#/components/schemas/therapistSignupSwaggerSchema' }
        }
        #swagger.responses[200] = { description: 'Successful' }
*/
    validateRequest(therapistValidator.therapistSignUpValidator),
    therapistController.signupTherapist
);

router.get("/filter-list",
    /*
        #swagger.tags = ['Therapist']
        #swagger.summary = 'Fetch therapists with search and category filter'
        #swagger.parameters['category_id'] = {
            in: 'query',
            description: 'Category ID to filter therapists',
            required: false,
            type: 'integer',
        }
        #swagger.parameters['search'] = {
            in: 'query',
            description: 'Search term to filter therapists by name',
            required: false,
            type: 'string',
        }
        #swagger.parameters['page'] = {
            in: 'query',
            description: 'Page number for pagination',
            required: false,
            type: 'integer',
        }
        #swagger.parameters['limit'] = {
            in: 'query',
            description: 'Number of items per page for pagination',
            required: false,
            type: 'integer',
        }
        #swagger.responses[200] = { description: 'Successful' }
    */
    therapistController.searchTherapist
);

router.post("/login-via-invitation",
    /*
        #swagger.tags = ['Therapist']
        #swagger.summary = 'therapist-login-via-invitation'
        #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: { $ref: '#/components/schemas/loginViaInvitationSwaggerSchema' }
        }
        #swagger.responses[200] = { description: 'Successful' }
*/
    validateRequest(therapistValidator.loginViaInvitationValidator),
    therapistController.therapistLoginViaInvitation
);

router.get("/therapist-profile",
    /*
    #swagger.tags = ['Therapist']
    #swagger.summary = 'therapist-profile'
    #swagger.responses[200] = { description: 'Successful' }
   */
    isAuthenticatedUser,
    isAuthorizedUser(user_type.Therapist),
    therapistController.therapistProfile
);

router.get("/therapist-details-via-link/:invitationLink",
    /*
    #swagger.tags = ['Therapist']
    #swagger.summary = 'therapist-details-via-link'
    #swagger.responses[200] = { description: 'Successful' }
   */
    therapistController.invitationLinkDetails
);

router.put("/manage-invitation",
    /*
    #swagger.tags = ['Therapist']
    #swagger.summary = 'manage-invitation'
    #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: { $ref: '#/components/schemas/manageInvitationSwaggerSchema' }
    }
    #swagger.responses[200] = { description: 'Successful' }
   */
    isAuthenticatedUser,
    isAuthorizedUser(user_type.Therapist),
    validateRequest(therapistValidator.manageInvitationValidator),
    therapistController.manageInvitation
);
// Register Swagger schemas
export const therapistSwaggerSchemas = (swaggerDoc) => {
    swaggerDoc.components.schemas.therapistSignupSwaggerSchema = j2s(therapistValidator.therapistSignUpValidator).swagger;
    swaggerDoc.components.schemas.loginViaInvitationSwaggerSchema = j2s(therapistValidator.loginViaInvitationValidator).swagger;
    swaggerDoc.components.schemas.manageInvitationSwaggerSchema = j2s(therapistValidator.manageInvitationValidator).swagger;
};

export default router;
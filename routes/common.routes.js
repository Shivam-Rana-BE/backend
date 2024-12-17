import express from "express";
const router = express.Router();
import { validateRequest, } from "../utils/Validations/index.js";
import { commonValidator } from "../utils/Validations/index.js";
import { commonController } from "../controller/index.js";
import j2s from "joi-to-swagger";
import { isAuthenticatedAndAuthorized } from "../middleware/auth.middleware.js";
import { user_type } from "../utils/constant.js";

router.post("/login",
  /*
  #swagger.tags = ['Common']
  #swagger.summary = 'login'
  #swagger.parameters['body'] = {
  in: 'body',
  required: true,
  schema: { $ref: '#/components/schemas/loginSwaggerSchema' }
  }
  #swagger.responses[200] = { description: 'Successful' }
  */
  validateRequest(commonValidator.signInValidator),
  commonController.SignIn
);

router.post("/forgot-password",
  /*
  #swagger.tags = ['Common']
  #swagger.summary = 'forgot-password'
  #swagger.parameters['body'] = {
  in: 'body',
  required: true,
  schema: { $ref: '#/components/schemas/forgotPasswordSwaggerSchema' }
  }
  #swagger.responses[200] = { description: 'Successful' }
  */
  validateRequest(commonValidator.forgotPasswordValidator),
  commonController.forgotPassword
);

router.post("/verify-code",
  /*
  #swagger.tags = ['Common']
  #swagger.summary = 'verify-code'
  #swagger.parameters['body'] = {
  in: 'body',
  required: true,
  schema: { $ref: '#/components/schemas/verifyCodeSwaggerSchema' }
  }
  #swagger.responses[200] = { description: 'Successful' }
  */
  validateRequest(commonValidator.verifyOtpValidator),
  commonController.verifyCode
);

router.post("/reset-password",
  /*
  #swagger.tags = ['Common']
  #swagger.summary = 'reset-password'
  #swagger.parameters['body'] = {
  in: 'body',
  required: true,
  schema: { $ref: '#/components/schemas/loginSwaggerSchema' }
  }
  #swagger.responses[200] = { description: 'Successful' }
  */
  validateRequest(commonValidator.signInValidator),
  commonController.resetPassword
);

router.post("/site-setting",
  /*
  #swagger.tags = ['Common']
  #swagger.summary = 'manage-site-setting'
  #swagger.parameters['body'] = {
  in: 'body',
  required: true,
  schema: { $ref: '#/components/schemas/siteSettingSwaggerSchema' }
  }
  #swagger.responses[200] = { description: 'Successful' }
  */
  validateRequest(commonValidator.siteSettingValidator),
  commonController.manageSiteSetting
);

router.get('/site-setting',
  /*
  #swagger.tags = ['Common']
  #swagger.summary = 'get-site-setting'
  #swagger.security = [{ "BearerAuth": [] }]
  #swagger.responses[200] = { description: 'Successful' }
  */
  commonController.fetchSiteSetting);

router.post('/fetch-invitations',
  /*
    #swagger.tags = ['Common']
    #swagger.summary = 'Fetch list of all invitations'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.parameters['authorization'] = {
     in: 'body',
      required: true,
      schema: { $ref: '#/components/schemas/fetchInvitationsSwaggerSchema' }
    }  
    #swagger.responses[200] = { description: 'Invitations fetched successfully' }
  */
  isAuthenticatedAndAuthorized([user_type.Admin, user_type.TherapyCenter]),
  validateRequest(commonValidator.fetchInvitationsValidator),
  commonController.fetchInvitations
);

router.delete('/delete-invitation/:id',
  /*
    #swagger.tags = ['Common']
    #swagger.summary = 'Delete an invitation'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.responses[200] = { description: 'Invitation deleted successfully' }
  */
  isAuthenticatedAndAuthorized([user_type.Admin, user_type.TherapyCenter]),
  commonController.deleteInvitation
);

router.post('/update-invitation',
  /*
    #swagger.tags = ['Common']
    #swagger.summary = 'Update invited user'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { $ref: '#/components/schemas/updateInvitedCentreSwaggerSchema' }
    }
    #swagger.responses[200] = { description: 'Invitation send successfully' }
  */
  isAuthenticatedAndAuthorized([user_type.Admin, user_type.TherapyCenter]),
  validateRequest(commonValidator.updateInvitedCentreValidator),
  commonController.updateInvitationDetails
);

router.post('/resend-invitation-mail',
  /*
    #swagger.tags = ['Common']
    #swagger.summary = 'resend-invitation-mail'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { $ref: '#/components/schemas/resendInvitationSwaggerSchema' }
    }
    #swagger.responses[200] = { description: 'Resend invitation send successfully' }
  */
  isAuthenticatedAndAuthorized([user_type.Admin, user_type.TherapyCenter]),
  validateRequest(commonValidator.resendInvitationValidator),
  commonController.resendInvitationMail
);

export const commonSwaggerRoutes = (swaggerDoc) => {
  swaggerDoc.components.schemas.loginSwaggerSchema = j2s(commonValidator.signInValidator).swagger;
  swaggerDoc.components.schemas.forgotPasswordSwaggerSchema = j2s(commonValidator.forgotPasswordValidator).swagger;
  swaggerDoc.components.schemas.verifyCodeSwaggerSchema = j2s(commonValidator.verifyOtpValidator).swagger;
  swaggerDoc.components.schemas.siteSettingSwaggerSchema = j2s(commonValidator.siteSettingValidator).swagger;
  swaggerDoc.components.schemas.fetchInvitationsSwaggerSchema = j2s(commonValidator.fetchInvitationsValidator).swagger;
  swaggerDoc.components.schemas.updateInvitedCentreSwaggerSchema = j2s(commonValidator.updateInvitedCentreValidator).swagger;
  swaggerDoc.components.schemas.resendInvitationSwaggerSchema = j2s(commonValidator.resendInvitationValidator).swagger;
};

export default router;
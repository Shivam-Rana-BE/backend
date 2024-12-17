import express from "express";
const router = express.Router();
import { validateFormData, validateRequest, } from "../utils/Validations/index.js";
import { therapistCenterValidator } from "../utils/Validations/index.js";
import { therapistCenterController } from "../controller/index.js";
import j2s from "joi-to-swagger";
import { isAuthenticatedUser, isAuthorizedUser } from "../middleware/auth.middleware.js";
import { user_type } from "../utils/constant.js";
import { upload } from "../lib/file-upload/multer.js";


router.post("/signup",
  /*
   #swagger.tags = ['Therapist Center']
   #swagger.summary = 'therapist-center-signup'
   #swagger.parameters['body'] = {
   in: 'body',
   required: true,
   schema: { $ref: '#/components/schemas/therapistCenterSignupSwaggerSchema' }
   }
   #swagger.responses[200] = { description: 'Successful' }
*/
  validateRequest(therapistCenterValidator.therapistCenterSignUpValidator),
  therapistCenterController.signupTherapistCenter
);

router.post('/login-via-invitation',
  /*
    #swagger.tags = ['Therapist Center']
    #swagger.summary = 'login-via-invitation'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { $ref: '#/components/schemas/loginViaInvitationSwaggerSchema' }
    }
    #swagger.responses[200] = { description: 'Successfully' }
  */
  validateRequest(therapistCenterValidator.loginViaInvitationValidator),
  therapistCenterController.loginViaInvitation
);

// sub centers
router.post("/sub-center",
  /*
   #swagger.tags = ['Therapist Center']
   #swagger.summary = 'add-sub-center'
   #swagger.parameters['body'] = {
   in: 'body',
   required: true,
   schema: { $ref: '#/components/schemas/addSubCenterSwaggerSchema' }
   }
   #swagger.responses[200] = { description: 'Successful' }
*/
  isAuthenticatedUser,
  isAuthorizedUser(user_type.TherapyCenter),
  validateRequest(therapistCenterValidator.addSubCenterValidator),
  therapistCenterController.addSubCenter
);

// invite therapist
router.post("/invite-therapist",
  /*
   #swagger.tags = ['Therapist Center']
   #swagger.summary = 'invite-therapist'
   #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { $ref: '#/components/schemas/inviteTherapistSwaggerSchema' }
    }
    #swagger.responses[200] = { description: 'Invitation send successfully' }
*/
  isAuthenticatedUser,
  isAuthorizedUser(user_type.TherapyCenter),
  validateRequest(therapistCenterValidator.inviteTherapistValidator),
  therapistCenterController.inviteTherapist
);

// add therapist
router.post("/add-therapist",
  /*
   #swagger.tags = ['Therapist Center']
   #swagger.summary = 'add-therapist'
   #swagger.parameters['body'] = {
   in: 'body',
   required: true,
   schema: { $ref: '#/components/schemas/addTherapistSwaggerSchema' }
   }
   #swagger.responses[200] = { description: 'Successful' }
*/
  isAuthenticatedUser,
  isAuthorizedUser(user_type.TherapyCenter),
  validateRequest(therapistCenterValidator.addTherapistValidator),
  therapistCenterController.addTherapist
);

router.get("/center-therapist-list",
  /*
    #swagger.tags = ['Therapist Center']
    #swagger.summary = 'fetch-all-therapist-of-center'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.parameters['page'] = {in: 'query',required: false,schema: { type: 'integer', example: 1 }}
    #swagger.parameters['limit'] = { in: 'query',required: false, schema: { type: 'integer', example: 10 }}
    #swagger.parameters['search'] = { in: 'query',required: false, schema: { type: 'string'}}
    #swagger.responses[200] = {description: 'Successful'}
  */
  isAuthenticatedUser,
  isAuthorizedUser(user_type.TherapyCenter),
  therapistCenterController.getCenterTherapist
);

router.post('/manage-therapist-status',
  /*
    #swagger.tags = ['Therapist Center']
    #swagger.summary = 'manage-therapist-status'
    #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: { $ref: '#/components/schemas/manageTherapistStatusSwaggerSchema' }
    }
    #swagger.responses[200] = { description: 'Successful' }
 */
  isAuthenticatedUser,
  isAuthorizedUser(user_type.TherapyCenter),
  validateRequest(therapistCenterValidator.manageTherapistStatusValidator),
  therapistCenterController.manageTherapistStatus
);


router.delete('/delete-therapist/:therapist_id',
  /*
     #swagger.tags = ['Therapist Center']
     #swagger.summary = 'soft-delete-therapist'
     #swagger.parameters['therapist_id'] = {
     in: 'path',
     required: true,
     schema: { type: 'integer' }
     }
     #swagger.responses[200] = { description: 'Successful' }
  */
  isAuthenticatedUser,
  isAuthorizedUser(user_type.TherapyCenter),
  therapistCenterController.deleteTherapistFromCenter
);

router.get('/fetch-profile',
  /*
      #swagger.tags = ['Therapist Center']
      #swagger.summary = 'Fetch the profile of the logged-in therapy center'
      #swagger.responses[200] = {description: 'Profile fetched successfully'}
      #swagger.responses[404] = { description: 'Profile not found' }
   */

  isAuthenticatedUser,
  isAuthorizedUser(user_type.TherapyCenter),
  therapistCenterController.fetchProfile
);

router.put("/update-profile",
  /*
  #swagger.tags = ['Therapist Center']
  #swagger.summary = 'Update Therapist Center Profile'
  #swagger.security = [{ "BearerAuth": [] }]
  #swagger.consumes = ['multipart/form-data']
  #swagger.parameters['therapy_center_name'] = {in: 'formData', required: true, type: 'string', description: 'Therapy center name'}
  #swagger.parameters['brand_name'] = { in: 'formData', required: true, type: 'string', description: 'Brand name of the therapy center'}
  #swagger.parameters['email'] = {  in: 'formData', required: true, type: 'string', description: 'Email of the therapy center'}
  #swagger.parameters['contact_number'] = {  in: 'formData', required: true, type: 'string', description: 'Contact number of the therapy center' }
  #swagger.parameters['website'] = {  in: 'formData', required: true, type: 'string', description: 'Website URL of the therapy center' }
  #swagger.parameters['profile_image'] = {  in: 'formData', type: 'file', description: 'Profile image of the therapy center' }
  #swagger.responses[200] = {  description: 'Successful' }
  */
  isAuthenticatedUser,
  isAuthorizedUser(user_type.TherapyCenter),
  upload.single('profile_image'),
  validateFormData(therapistCenterValidator.centerProfileUpdateValidator),
  therapistCenterController.updateCenterProfile
);

router.get('/fetch-therapist/:therapist_id',
  /*
     #swagger.tags = ['Therapist Center']
     #swagger.summary = 'Fetch Therapist Details'
     #swagger.parameters['therapist_id'] = {
     in: 'path',
     required: true,
     schema: { type: 'integer' }
     }
     #swagger.responses[200] = { 
       description: 'Successful'
       
     }
  */
  isAuthenticatedUser,
  isAuthorizedUser(user_type.TherapyCenter),
  therapistCenterController.getTherapistDetails
);



// Register Swagger schemas
export const therapistCenterSwaggerSchemas = (swaggerDoc) => {
  swaggerDoc.components.schemas.therapistCenterSignupSwaggerSchema = j2s(therapistCenterValidator.therapistCenterSignUpValidator).swagger;
  swaggerDoc.components.schemas.addSubCenterSwaggerSchema = j2s(therapistCenterValidator.addSubCenterValidator).swagger;
  swaggerDoc.components.schemas.addTherapistSwaggerSchema = j2s(therapistCenterValidator.addTherapistValidator).swagger;
  swaggerDoc.components.schemas.manageTherapistStatusSwaggerSchema = j2s(therapistCenterValidator.manageTherapistStatusValidator).swagger;
  swaggerDoc.components.schemas.loginViaInvitationSwaggerSchema = j2s(therapistCenterValidator.loginViaInvitationValidator).swagger;
  swaggerDoc.components.schemas.inviteTherapistSwaggerSchema = j2s(therapistCenterValidator.inviteTherapistValidator).swagger;

};
export default router;
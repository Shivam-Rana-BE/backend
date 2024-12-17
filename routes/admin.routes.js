import express from 'express';
import { adminController } from "../controller/index.js";
import { isAuthenticatedAdmin } from "../middleware/auth.middleware.js";
import { adminValidator, validateFormData, validateRequest, therapistCategoryValidator, commonValidator } from "../utils/Validations/index.js";
import { multerErrorHandler, upload } from '../lib/file-upload/multer.js';
const router = express.Router();
import j2s from "joi-to-swagger";

router.post("/login",
  /*
  #swagger.tags = ['Admins']
  #swagger.summary = 'login'
  #swagger.parameters['body'] = {
  in: 'body',
  required: true,
  schema: { $ref: '#/components/schemas/loginSwaggerSchema' }
  }
  #swagger.responses[200] = { description: 'Successful' }
  */
  validateRequest(commonValidator.signInValidator),
  adminController.adminLogin
);
router.post("/milestone-question",
  /*
    #swagger.tags = ['Admins']
    #swagger.summary = 'add-milestone-question'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.consumes = ['multipart/form-data']
    #swagger.parameters['question'] = { in: 'formData', required: true, type: 'string' }
    #swagger.parameters['que_icon'] = { in: 'formData', type: 'file' }
    #swagger.responses[200] = { description: 'Successful' }
  */
  isAuthenticatedAdmin,
  upload.single('que_icon'),
  multerErrorHandler,
  validateFormData(adminValidator.addQuestionValidator, ['que_icon']),
  adminController.addMilestoneQuestion
);

router.put("/milestone-question",
  /*
    #swagger.tags = ['Admins']
    #swagger.summary = 'update-milestone-question'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.consumes = ['multipart/form-data']
    #swagger.parameters['questionId'] = { in: 'formData', required: true, type: 'number' }
    #swagger.parameters['question'] = { in: 'formData', required: true, type: 'string' }
    #swagger.parameters['que_icon'] = { in: 'formData', type: 'file' }
    #swagger.responses[200] = { description: 'Successful' }
  */
  isAuthenticatedAdmin,
  upload.single('que_icon'),
  multerErrorHandler,
  validateFormData(adminValidator.updateQuestionValidator),
  adminController.updateMilestoneQuestions
);

router.get('/milestone-questions',
  /*
    #swagger.tags = ['Admins']
    #swagger.summary = 'Get milestone questions'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.parameters['page'] = {in: 'query',required: false,schema: { type: 'integer', example: 1 }}
    #swagger.parameters['limit'] = { in: 'query',required: false, schema: { type: 'integer', example: 10 }}
    #swagger.responses[200] = {description: 'Successful'}
  */
  isAuthenticatedAdmin,
  adminController.getMilestoneQuestions
);

router.delete("/milestone-question/:questionId",
  /*
  #swagger.tags = ['Admins']
  #swagger.summary = 'remove-milestone-question'
  #swagger.security = [{ "BearerAuth": [] }]
  #swagger.parameters['questionId'] = { in: 'path', required: true, schema: { type: 'string' } }
  #swagger.responses[200] = { description: 'Successful' }
  */
  isAuthenticatedAdmin,
  adminController.removeMilestoneQuestion
)

router.get("/therapist-centers",
  /*
    #swagger.tags = ['Admins']
    #swagger.summary = 'fetch-all-therapist-center'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.parameters['page'] = {in: 'query',required: false,schema: { type: 'integer', example: 1 }}
    #swagger.parameters['limit'] = { in: 'query',required: false, schema: { type: 'integer', example: 10 }}
    #swagger.parameters['search'] = { in: 'query',required: false, schema: { type: 'string'}}
    #swagger.responses[200] = {description: 'Successful'}
  */
  isAuthenticatedAdmin,
  adminController.getAllTherapistCenter
);

router.get("/parent-kids/:parentId",
  /*
    #swagger.tags = ['Admins']
    #swagger.summary = 'fetch-all-kids-of-parent'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.responses[200] = {description: 'Successful'}
  */
  isAuthenticatedAdmin,
  adminController.getAllKidOfParent
);
router.get("/parents-list",
  /*
    #swagger.tags = ['Admins']
    #swagger.summary = 'fetch-all-parents-list'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.parameters['page'] = {in: 'query',required: false,schema: { type: 'integer', example: 1 }}
    #swagger.parameters['limit'] = { in: 'query',required: false, schema: { type: 'integer', example: 10 }}
    #swagger.parameters['search'] = { in: 'query',required: false, schema: { type: 'string'}}
    #swagger.responses[200] = {description: 'Successful'}
  */
  isAuthenticatedAdmin,
  adminController.getAllParents
);

router.get("/kids-list",
  /*
  #swagger.tags = ['Admins']
  #swagger.summary = 'fetch-all-kids-list'
  #swagger.security = [{ "BearerAuth": [] }]
  #swagger.parameters['page'] = {in: 'query',required: false,schema: { type: 'integer', example: 1 }}
  #swagger.parameters['limit'] = { in: 'query',required: false, schema: { type: 'integer', example: 10 }}
  #swagger.parameters['search'] = { in: 'query',required: false, schema: { type: 'string'}}
  #swagger.responses[200] = {description: 'Successful'}
*/
  isAuthenticatedAdmin,
  adminController.getAllKids

);

// Create new therapist category
router.post('/add-category',
  /*
     #swagger.tags = ['Admins']
    #swagger.summary = 'Create a new therapist category'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { $ref: '#/components/schemas/addTherapistCategorySwaggerSchema' }
    }
    #swagger.responses[200] = { description: 'Category added successfully' }
    #swagger.responses[400] = { description: 'Category name already exists' }
  */
  isAuthenticatedAdmin,
  validateRequest(therapistCategoryValidator.addTherapistCategoryValidator),
  adminController.addTherapistCategory
);

// Get all therapist categories 
router.get('/all-categories',
  /*
    #swagger.tags = ['Admins']
    #swagger.summary = 'Get all therapist categories'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.responses[200] = { description: 'List of therapist categories' }
  */
  // isAuthenticatedAdmin,
  adminController.getAllTherapistCategories
);

//update therapist category by id
router.put('/update-category/:id',
  /*
     #swagger.tags = ['Admins']
    #swagger.summary = 'Update therapist category by ID'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer', description: 'ID of the therapist category to update' }
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { $ref: '#/components/schemas/updateTherapistCategorySwaggerSchema' }
    }
    #swagger.responses[200] = { description: 'Category updated successfully' }
    #swagger.responses[400] = { description: 'Category not found' }
  */
  isAuthenticatedAdmin,
  validateRequest(therapistCategoryValidator.updateTherapistCategoryValidator),
  adminController.updateTherapistCategory
);

// Soft delete therapist category by id
router.delete('/delete-category/:id',
  /*
    #swagger.tags = ['Admins']
    #swagger.summary = 'Soft delete therapist category by ID'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer', description: 'ID of the therapist category to delete' }
    #swagger.responses[200] = { description: 'Therapist category deleted successfully' }
    #swagger.responses[400] = { description: 'Category not found' }
  */
  isAuthenticatedAdmin,
  adminController.deleteTherapistCategory
);

router.post('/invite-therapy-center',
  /*
    #swagger.tags = ['Admins']
    #swagger.summary = 'Invite therapy center'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { $ref: '#/components/schemas/inviteTherapyCenterSwaggerSchema' }
    }
    #swagger.responses[200] = { description: 'Invitation send successfully' }
  */
  isAuthenticatedAdmin,
  validateRequest(adminValidator.inviteTherapyCenterValidator),
  adminController.inviteTherapyCenter
);

router.post('/change-user-status',
  /*
    #swagger.tags = ['Admins']
    #swagger.summary = 'Change user status'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { $ref: '#/components/schemas/changeUserStatusSwaggerSchema' }
    }
    #swagger.responses[200] = { description: 'Successfully' }
  */
  isAuthenticatedAdmin,
  validateRequest(adminValidator.changeUserStatusValidator),
  adminController.changeUserStatus
);

router.delete("/delete-user/:userId",
  /*
  #swagger.tags = ['Admins']
  #swagger.summary = 'delete-user'
  #swagger.security = [{ "BearerAuth": [] }]
  #swagger.parameters['userId'] = { in: 'path', required: true, schema: { type: 'number' } }
  #swagger.responses[200] = { description: 'Successful' }
  */
  isAuthenticatedAdmin,
  adminController.deleteUser
)

router.post('/manage-center-availability',
  /*
    #swagger.tags = ['Admins']
    #swagger.summary = 'manage-center-availability'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { $ref: '#/components/schemas/manageAvailabilitySwaggerSchema' }
    }
    #swagger.responses[200] = { description: 'Successfully' }
  */
  isAuthenticatedAdmin,
  validateRequest(adminValidator.manageAvailabilityValidator),
  adminController.manageAvailability
);

router.put('/update-center-details',
  /*
    #swagger.tags = ['Admins']
    #swagger.summary = 'update-center-details'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { $ref: '#/components/schemas/updateCentreDetailsSwaggerSchema' }
    }
    #swagger.responses[200] = { description: 'Successfully' }
  */
  isAuthenticatedAdmin,
  validateRequest(adminValidator.updateCentreDetailsValidator),
  adminController.updateCenterDetails
);



// Register Swagger schemas
export const adminSwaggerSchemas = (swaggerDoc) => {
  swaggerDoc.components.schemas.addTherapistCategorySwaggerSchema = j2s(therapistCategoryValidator.addTherapistCategoryValidator).swagger;
  swaggerDoc.components.schemas.updateTherapistCategorySwaggerSchema = j2s(therapistCategoryValidator.updateTherapistCategoryValidator).swagger;
  swaggerDoc.components.schemas.inviteTherapyCenterSwaggerSchema = j2s(adminValidator.inviteTherapyCenterValidator).swagger;
  swaggerDoc.components.schemas.changeUserStatusSwaggerSchema = j2s(adminValidator.changeUserStatusValidator).swagger;
  swaggerDoc.components.schemas.manageAvailabilitySwaggerSchema = j2s(adminValidator.manageAvailabilityValidator).swagger;
  swaggerDoc.components.schemas.updateCentreDetailsSwaggerSchema = j2s(adminValidator.updateCentreDetailsValidator).swagger;
};

export default router;

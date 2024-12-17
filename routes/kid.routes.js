import express from 'express';
import { kidController } from "../controller/index.js";
import { isAuthenticatedUser, isAuthorizedUser } from "../middleware/auth.middleware.js";
import { kidValidator, parentValidator, validateFormData, validateRequest } from "../utils/Validations/index.js";
import { multerErrorHandler, upload } from '../lib/file-upload/multer.js';
const router = express.Router();
import j2s from "joi-to-swagger";
import { user_type } from '../utils/constant.js';

router.post("/add-kid",
    /*
      #swagger.tags = ['Kids']
      #swagger.summary = 'add-kid'
      #swagger.security = [{ "BearerAuth": [] }]
      #swagger.consumes = ['multipart/form-data']
      #swagger.parameters['name'] = { in: 'formData', required: true, type: 'string' }
      #swagger.parameters['date_of_birth'] = { in: 'formData', required: true, type: 'string' }
      #swagger.parameters['diagnosis'] = { in: 'formData', required: true, type: 'string' }
      #swagger.parameters['attachments'] = { in: 'formData', type: 'array', items: { type: 'file' } }
      #swagger.parameters['profile_image'] = { in: 'formData', type: 'file' }
      #swagger.responses[200] = { description: 'Successful' }
  */
    isAuthenticatedUser,
    isAuthorizedUser(user_type.Parent),
    upload.fields([
        { name: 'attachments' },
        { name: 'profile_image', maxCount: 1 }
    ]),
    multerErrorHandler,
    validateFormData(parentValidator.addKidValidator),
    kidController.addKid
);

router.get('/:id',
    /*
    #swagger.tags = ['Kids']
    #swagger.summary = 'get-profile'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.responses[200] = { description: 'Successful' }
    */
    isAuthenticatedUser,
    isAuthorizedUser(user_type.Parent),
    kidController.getKid);

router.patch('/change-status',
    /*
    #swagger.tags = ['Kids']
    #swagger.summary = 'status-change'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: { $ref: '#/components/schemas/statusSwaggerSchema' }
        }
        #swagger.responses[200] = { description: 'Successful' }
        */
    isAuthenticatedUser,
    isAuthorizedUser(user_type.Parent),
    validateRequest(kidValidator.statusValidator), kidController.changeKidStatus);

router.put("/remove-kid/:id",
    /*
        #swagger.tags = ['Kids']
        #swagger.summary = 'remove-kid'
        #swagger.security = [{ "BearerAuth": [] }]
        #swagger.parameters['id'] = { in: 'path', required: true, schema: { type: 'string' } }
        #swagger.responses[200] = { description: 'Successful' }
        */
    isAuthenticatedUser,
    isAuthorizedUser(user_type.Parent),
    kidController.removeKid,
)
router.put("/update-kid",
    /*
      #swagger.tags = ['Kids']
      #swagger.summary = 'update-Kid'
      #swagger.security = [{ "BearerAuth": [] }]
      #swagger.consumes = ['multipart/form-data']
      #swagger.parameters['kidId'] = { in: 'formData', required: true, type: 'number' }
      #swagger.parameters['name'] = { in: 'formData', required: true, type: 'string' }
      #swagger.parameters['date_of_birth'] = { in: 'formData', required: true, type: 'string' }
      #swagger.parameters['diagnosis'] = { in: 'formData', required: true, type: 'string' }
      #swagger.parameters['attachments'] = { in: 'formData', type: 'array', items: { type: 'file' } }
      #swagger.parameters['removeAttachments'] = {
      in: 'formData',
      type: 'array',
      items: { type: 'string' },
      collectionFormat: 'multi'
     }
      #swagger.parameters['profile_image'] = { in: 'formData', type: 'file' }
      #swagger.responses[200] = { description: 'Successful' }
    */
    isAuthenticatedUser,
    isAuthorizedUser(user_type.Parent),
    upload.fields([{ name: 'attachments' }, { name: 'profile_image', maxCount: 1 }]),
    multerErrorHandler,
    (req, res, next) => {
        if (typeof req.body.removeAttachments === 'string') {
            req.body.removeAttachments = [req.body.removeAttachments];
        }
        next();
    },
    validateFormData(kidValidator.updateKidValidator),
    kidController.updateKid,
)

router.post('/milestones/submit-answer',
    /*
    #swagger.tags = ['Kids']
    #swagger.summary = 'submit-milestone-answer'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: { $ref: '#/components/schemas/submitMilestoneSwaggerSchema' }
    }
    #swagger.responses[200] = { description: 'Successful' }
    */
    isAuthenticatedUser,
    isAuthorizedUser(user_type.Parent),
    validateRequest(kidValidator.submitMilestoneValidator),
    kidController.submitMilestoneAnswer);

router.get('/milestones/pending-questions/:kidId',
    /*
    #swagger.tags = ['Kids']
    #swagger.summary = 'pending-questions-list'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.parameters['kidId'] = { in: 'path', required: true, schema: { type: 'string' } }
    #swagger.responses[200] = { description: 'Successful' }
    */
    isAuthenticatedUser,
    isAuthorizedUser(user_type.Parent),
    kidController.getPendingMilestoneQuestions);

router.get('/milestones/activity/:kidId',
    /*
    #swagger.tags = ['Kids']
    #swagger.summary = 'milestone-activity-list'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.parameters['kidId'] = { in: 'path', required: true, schema: { type: 'string' } }
    #swagger.responses[200] = { description: 'Successful' }
    */
    isAuthenticatedUser,
    isAuthorizedUser(user_type.Parent),
    kidController.getMilestoneActivity);


// Register Swagger schemas
export const kidSwaggerSchemas = (swaggerDoc) => {
    swaggerDoc.components.schemas.statusSwaggerSchema = j2s(kidValidator.statusValidator).swagger;
    swaggerDoc.components.schemas.submitMilestoneSwaggerSchema = j2s(kidValidator.submitMilestoneValidator).swagger;
};

export default router;

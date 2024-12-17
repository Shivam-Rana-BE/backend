import express from "express";
const router = express.Router();
import { validateFormData, validateRequest, } from "../utils/Validations/index.js";
import { parentValidator } from "../utils/Validations/index.js";
import { parentController } from "../controller/index.js";
import { isAuthenticatedUser, isAuthorizedUser } from "../middleware/auth.middleware.js";
import { upload, multerErrorHandler } from '../lib/file-upload/multer.js';
import j2s from "joi-to-swagger";
import { user_type } from "../utils/constant.js";


router.post("/signup",
    /*
         #swagger.tags = ['Parents']
         #swagger.summary = 'parent-signup'
         #swagger.parameters['body'] = {
         in: 'body',
         required: true,
         schema: { $ref: '#/components/schemas/parentSignupSwaggerSchema' }
         }
         #swagger.responses[200] = { description: 'Successful' }
      */
    validateRequest(parentValidator.parentSignUpValidator),
    parentController.parentSignup
);

router.get("/get-profile",
    /*
    #swagger.tags = ['Parents']
    #swagger.summary = 'get-profile'
    #swagger.security = [{ "BearerAuth": [] }] 
    #swagger.responses[200] = { description: 'Successful' }
   */
    isAuthenticatedUser,
    isAuthorizedUser(user_type.Parent),
    parentController.getProfile
);

router.put("/update-profile",
    /*
    #swagger.tags = ['Parents']
    #swagger.summary = 'update-profile'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.consumes = ['multipart/form-data']
    #swagger.parameters['name'] = { in: 'formData', required: true, type: 'string' }
    #swagger.parameters['email'] = { in: 'formData', required: true, type: 'string' }
    #swagger.parameters['phone_number'] = { in: 'formData', required: true, type: 'string' }
    #swagger.parameters['profile_image'] = { in: 'formData', type: 'file' }
    #swagger.responses[200] = { description: 'Successful' }
  */
    isAuthenticatedUser,
    isAuthorizedUser(user_type.Parent),
    upload.single('profile_image'),
    validateFormData(parentValidator.updateProfileValidator),
    parentController.updateProfile
);

router.put("/change-password",
    /*
       #swagger.tags = ['Parents']
       #swagger.summary = 'change-password'
       #swagger.security = [{ "BearerAuth": [] }]
       #swagger.parameters['body'] = {
       in: 'body',
       required: true,
       schema: { $ref: '#/components/schemas/changePasswordSwaggerSchema' }
       }
       #swagger.responses[200] = { description: 'Successful' }
    */
    isAuthenticatedUser,
    // isAuthorizedUser(user_type.Parent),
    validateRequest(parentValidator.changePasswordValidator),
    parentController.changePassword
);

router.get("/get-kid-list",
    /*
     #swagger.tags = ['Parents']
     #swagger.summary = 'get-kid-list'
     #swagger.security = [{ "BearerAuth": [] }]
     #swagger.responses[200] = { description: 'Successful' }
    */
    isAuthenticatedUser,
    isAuthorizedUser(user_type.Parent),
    parentController.getKidList
);



// Register Swagger schemas
export const parentSwaggerSchemas = (swaggerDoc) => {
    swaggerDoc.components.schemas.parentSignupSwaggerSchema = j2s(parentValidator.parentSignUpValidator).swagger;
    swaggerDoc.components.schemas.changePasswordSwaggerSchema = j2s(parentValidator.changePasswordValidator).swagger;
};

export default router;
import express from "express";
const router = express.Router();
import { chatValidator, validateFormData, validateRequest, } from "../utils/Validations/index.js";
import { commonValidator } from "../utils/Validations/index.js";
import { chatController, } from "../controller/index.js";
import j2s from "joi-to-swagger";
import { isAuthenticatedUser } from "../middleware/auth.middleware.js";
import { upload } from "../lib/file-upload/multer.js";

router.post("/update-socket-id",
    /*
    #swagger.tags = ['Chat']
    #swagger.summary = 'update-socket-id'
    #swagger.responses[200] = { description: 'Successful' }
    */
    isAuthenticatedUser,
    chatController.updateSocketId
);
router.post("/check-group",
    /*
    #swagger.tags = ['Chat']
    #swagger.summary = 'check-group'
    #swagger.responses[200] = { description: 'Successful' }
    */
    isAuthenticatedUser,
    chatController.checkGroup
);
router.post("/create-private-group",
    /*
    #swagger.tags = ['Chat']
    #swagger.summary = 'create-private-group'
    #swagger.responses[200] = { description: 'Successful' }
    */
    isAuthenticatedUser,
    chatController.createPrivateGroup
);
router.post("/create-team-group",
    /*
    #swagger.tags = ['Chat']
    #swagger.summary = 'create-team-group'
      #swagger.consumes = ['multipart/form-data']
      #swagger.parameters['groupName'] = { in: 'formData', required: true, type: 'string' }
      #swagger.parameters['members'] = {
      in: 'formData',
      type: 'array',
      items: { type: 'string' },
      collectionFormat: 'multi'
     }
      #swagger.parameters['group_icon'] = { in: 'formData', type: 'file' }
    #swagger.responses[200] = { description: 'Successful' }
    */
    isAuthenticatedUser,
    upload.single('group_icon'),
    (req, res, next) => {
        if (typeof req.body.members === 'string') {
            req.body.members = [req.body.members];
        }
        next();
    },
    validateFormData(chatValidator.createTeamValidator),
    chatController.createTeamGroup
);
router.post("/reset-unread-count",
    /*
    #swagger.tags = ['Chat']
    #swagger.summary = 'reset-unread-count'
    #swagger.responses[200] = { description: 'Successful' }
    */
    isAuthenticatedUser,
    chatController.resetUnreadCount
);
router.post("/fetch-all-group",
    /*
    #swagger.tags = ['Chat']
    #swagger.summary = 'fetch-all-group'
    #swagger.responses[200] = { description: 'Successful' }
    */
    isAuthenticatedUser,
    chatController.fetchMyGroups
);

router.post("/get-group-members",
    /*
    #swagger.tags = ['Chat']
    #swagger.summary = 'get-group-members'
    #swagger.responses[200] = { description: 'Successful' }
    */
    isAuthenticatedUser,
    validateRequest(chatValidator.searchGroupMembers),
    chatController.fetchGroupMembers
);

router.get("/frequently-contacted-list",
    /*
    #swagger.tags = ['Chat']
    #swagger.summary = 'frequently-contacted-list'
    #swagger.responses[200] = { description: 'Successful' }
    */
    isAuthenticatedUser,
    chatController.fetchFrequentlyContacted
);

router.get("/single-group-details/:groupId",
    /*
    #swagger.tags = ['Chat']
    #swagger.summary = 'single-group-details'
    #swagger.responses[200] = { description: 'Successful' }
    */
    isAuthenticatedUser,
    chatController.fetchSingleGroupDetails
);
export const chatSwaggerRoutes = (swaggerDoc) => {

};

export default router;
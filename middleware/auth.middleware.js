import tokenManager from "../lib/token_manager.js";
import catchAsyncError from "./catchAsyncError.js";
import { response400, response401 } from "../lib/response-messages/index.js";
import { msg, user_type } from "../utils/constant.js";
import { adminService, parentService, therapistService, therapyCenterService, userService } from "../service/index.js";

const isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
    const headers = req.headers.authorization;
    if (!headers) return response401(res, msg.tokenRequiredErr);

    const token = headers.split(" ")[1];
    if (!token) return response401(res, msg.invalidToken);

    const data = await tokenManager.verifyToken(token);

    if (!data) return response401(res, msg.invalidToken);

    const user = await userService.check_user_exists({ id: data?.user_id, user_type: data.type });
    if (!user) return response401(res, msg.tokenExpired);

    if (user.account_status === "Inactive") return response401(res, msg.accountInActivated);
    if (user.account_status === "Suspended") return response401(res, msg.accountSuspended);

    req.user = user.id;
    next();
});

// authenticate middleware
const isAuthorizedUser = (role) => {
    return catchAsyncError(async (req, res, next) => {
        const id = req.user;
        let userData
        switch (role) {
            case user_type.Parent:
                userData = await parentService.check_parent_exists({ user_id: id, isDeleted: false });
                req.parent = userData.id
                break;

            case user_type.Therapist:
                userData = await therapistService.check_therapist({ user_id: id, isDeleted: false });
                req.therapist = userData.id
                break;

            case user_type.TherapyCenter:
                userData = await therapyCenterService.check_therapist_center({ user_id: id, isDeleted: false });
                req.therapyCenter = userData.id;
                break;
            default:
                return response400(res, msg.invalidRole);
        }
        next()
    });
}

const isAuthenticatedAdmin = catchAsyncError(async (req, res, next) => {

    const headers = req.headers.authorization;
    if (!headers) return response401(res, msg.tokenRequiredErr);

    const token = headers.split(" ")[1];
    if (!token) return response401(res, msg.invalidToken);

    const data = await tokenManager.verifyToken(token);

    if (!data) return response401(res, msg.invalidToken);

    const admin = await adminService.check_admin({ id: data?.user_id, isDeleted: false });
    if (!admin) return response401(res, msg.tokenExpired);

    req.admin = admin.id;
    next();
});

const isAuthenticatedAndAuthorized = (roles = []) => {
    return catchAsyncError(async (req, res, next) => {
        const headers = req.headers.authorization;
        if (!headers) return response401(res, msg.tokenRequiredErr);

        const token = headers.split(" ")[1];
        if (!token) return response401(res, msg.invalidToken);

        const data = await tokenManager.verifyToken(token);
        if (!data) return response401(res, msg.invalidToken);

        let userData;
        if (roles.includes(user_type.Admin) && data.type === user_type.Admin) {
            userData = await adminService.check_admin({ id: data?.user_id, isDeleted: false });
            if (!userData) return response401(res, msg.tokenExpired);

            req.admin = userData.id;
        } else if (roles.includes(user_type.TherapyCenter) && data.type === user_type.TherapyCenter) {
            userData = await therapyCenterService.check_therapist_center({ user_id: data?.user_id, isDeleted: false });
            if (!userData) return response401(res, msg.tokenExpired);

            req.therapyCenter = userData.id;
        } else {
            return response400(res, msg.invalidRole);
        }
        next();
    });
}

export { isAuthenticatedUser, isAuthenticatedAdmin, isAuthorizedUser, isAuthenticatedAndAuthorized }
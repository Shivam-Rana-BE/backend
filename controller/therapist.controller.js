import db from "../db/models/index.js";
import { response201, response400, response200 } from "../lib/response-messages/index.js";
import catchAsyncError from "../middleware/catchAsyncError.js";
import { commonService, therapistService, userService, therapistCategoryService, adminService, therapyCenterService } from "../service/index.js";
import { emailTemplates, hashPassword, invitation_status, msg, user_type, validatePassword } from "../utils/constant.js";
import sendEmail from "../utils/emailSender.js";
import { notificationText } from "../utils/notification.js";
import { Op } from "sequelize";

const signupTherapist = catchAsyncError(async (req, res) => {
    const { email, password, name, category_id, address } = req.body;

    // validation
    const isTherapistExists = await userService.check_user_exists({ email, user_type: user_type.Therapist });
    if (isTherapistExists) return response400(res, msg.emailIsExists);

    const categoryExists = await therapistCategoryService.get_therapist_category_by_id(category_id);
    if (!categoryExists) return response400(res, msg.categoryNotFound);

    req.body.password = hashPassword(password);
    req.body.isProfileComplete = true;

    const user = await userService.create_user({ email, password: req.body.password, name, user_type: user_type.Therapist });
    await therapistService.create_therapist({ ...req.body, user_id: user?.id, is_profile_complete: true });

    const tokenPayload = { id: user.id, type: user_type.Therapist };
    const token = await therapistService.create_therapist_token(tokenPayload);
    const response = { role: user_type.Therapist, token };

    // send welcome mail
    const isWelcomeMailEnabled = await commonService.checkNotification(notificationText.welcomeMail);
    if (isWelcomeMailEnabled) {
        await sendEmail({ email: email, data: { name }, templateId: emailTemplates.welcomeMail });
    }
    return response201(res, msg.therapistRegistered, response);
});

// therapist login via invitation, here we are added therapist in user and therapist model also link with center whom invite them
const therapistLoginViaInvitation = catchAsyncError(async (req, res) => {
    const { name, email, password, invitationLink, degree, experience, RCINo, category_id, address } = req.body;

    const invitation = await adminService.check_invitation({ email, invitation_link: invitationLink })
    if (!invitation) return response400(res, msg.emailIsNotExits)

    if (!validatePassword(password, invitation.password))
        return response400(res, msg.invalidPassword);

    // if (invitation.invitation_link !== invitationLink) return response400(res, msg.invalidInvitationLink)
    // if (invitation.expires_at <= new Date()) return response400(res, msg.expiredInvitationLink);

    const userDetails = await userService.check_user_exists({ email, user_type: user_type.Therapist })
    let tokenPayload = {}
    let user = {}
    if (!userDetails) {
        let hashedPassword = hashPassword(password);
        user = await userService.create_user({ email, password: hashedPassword, name: invitation.name, user_type: user_type.Therapist })
        const newTherapist = await therapistService.create_therapist({ ...req.body, password: hashedPassword, user_id: user?.id, is_profile_complete: true });
        // await therapyCenterService.create_center_therapist_link({ center_id: invitation.added_by_id, therapist_id: newTherapist.id });

        tokenPayload = { id: user.id, type: user_type.Therapist }

        const invitations = await therapistService.fetch_pending_invitations({ email, status: invitation_status.Pending })
        if (invitations.length) {
            await therapistService.create_center_link_payload(invitations, newTherapist?.id)
        }

        invitation.invitation_link = null
        await invitation.save()

    } else {
        tokenPayload = { id: userDetails.id, type: user_type.Therapist }
    }
    const token = await therapistService.create_therapist_token(tokenPayload)
    const response = { role: user_type.Therapist, token, user_id: user?.id }

    return response200(res, msg.loginSuccess, response);
});

// user details from invitation link
const invitationLinkDetails = catchAsyncError(async (req, res) => {
    const { invitationLink } = req.params;
    if (!invitationLink) return response400(res, msg.invitationLinkRequired)


    const invitation = await adminService.check_invitation({ invitation_link: invitationLink })
    if (!invitation) return response400(res, msg.invitedCenterNotFound)

    const user = await userService.check_user_exists({ email: invitation?.email, user_type: user_type.Therapist })
    return response200(res, msg.fetchSuccessfully, { user: user ? user : null });
});

// fetch all therapist
const searchTherapist = catchAsyncError(async (req, res) => {
    const { search, category_id, page = 1, limit = 10 } = req.query;

    const payload = {
        isDeleted: false,
        is_profile_complete: true,
        ...(search && { name: { [Op.iLike]: `%${search}%` } }),
        ...(category_id && { category_id }),
        page,
        limit
    };
    const result = await therapistService.get_therapist_by_filter(payload);
    return response200(res, msg.therapistFound, result);
});

// get login therapist profile
const therapistProfile = catchAsyncError(async (req, res) => {
    const therapistId = req.therapist;

    const data = await therapistService.fetch_therapist_profile({ id: therapistId, isDeleted: false },);

    return response200(res, msg.fetchSuccessfully, data);
});

// accept invitation
const manageInvitation = catchAsyncError(async (req, res) => {
    const therapistId = req.therapist;
    const { therapistLinkedId, status } = req.body

    const details = await therapistService.check_invitation({ id: therapistLinkedId, therapist_id: therapistId, status: invitation_status?.Pending, isDeleted: false })
    if (!details) response400(res, msg.therapistLinkDetailsNotFound)

    await therapistService.update_invitation({ id: therapistLinkedId, isDeleted: false }, { status: status });

    return response200(res, `Invitation ${status} successfully`,);
});
export {
    signupTherapist,
    searchTherapist,
    therapistLoginViaInvitation,
    therapistProfile,
    invitationLinkDetails,
    manageInvitation
}




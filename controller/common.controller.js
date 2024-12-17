import cryptoRandomString from "crypto-random-string";
import { response200, response400 } from "../lib/response-messages/index.js";
import token_manager from "../lib/token_manager.js";
import catchAsyncError from "../middleware/catchAsyncError.js";
import { adminService, commonService, parentService, therapistService, therapyCenterService, userService } from "../service/index.js";
import { emailTemplates, generateOtp, generateUniquePassword, hashPassword, invitation_status, msg, user_type, validatePassword } from "../utils/constant.js";
import sendEmail from "../utils/emailSender.js";

// sign in
const SignIn = catchAsyncError(async (req, res) => {
    const { email, password, role } = req.body;

    let userData, token, response = {};
    userData = await userService.check_user_exists({ email, user_type: role });
    if (!userData) return response400(res, msg.invalidCredentials);

    if (!validatePassword(password, userData.password))
        return response400(res, msg.invalidCredentials);

    if (userData.account_status === "Inactive") return response400(res, msg.accountInActivated);
    if (userData.account_status === "Suspended") return response400(res, msg.accountSuspended);

    token = await token_manager.create_token({ id: userData.id, type: role });
    response = { role, token, user_id: userData?.id }

    if (role === user_type.Parent) {
        let parent = await parentService.get_single_parent({ user_id: userData.id, isDeleted: false });
        response = {
            ...response,
            hasChildProfile: parent?.hasChildProfile,
            isProfileComplete: parent?.isProfileComplete,
        };
    }
    return response200(res, msg.loginSuccess, response);
});

// forgot password
const forgotPassword = catchAsyncError(async (req, res) => {
    const { email, role } = req.body;

    let userData = await userService.check_user_exists({ email, user_type: role });
    if (!userData) return response400(res, msg.emailIsNotExits);

    // Generate OTP and set expiration
    const { OTP, resetPasswordTokenExpires } = generateOtp();
    userData.reset_password_code = OTP;
    userData.reset_password_expires = resetPasswordTokenExpires;
    let emailPayload = {
        email: userData?.email,
        name: userData?.name,
        OTP: OTP
    }

    // Save the user data
    await userData.save();
    await sendEmail({ email: userData.email, data: emailPayload, templateId: emailTemplates.forgotPassword })
    return response200(res, msg.mainSendSuccess, { OTP });
});

// Reset Password Verification
const verifyCode = catchAsyncError(async (req, res) => {
    const { email, role, code } = req.body;

    let userData = await userService.check_user_exists({ email, user_type: role });
    if (!userData) return response400(res, msg.invalidCredentials);

    if (userData.reset_password_code !== code) return response400(res, msg.invalidOtp);
    if (userData.reset_password_expires <= new Date()) {
        return response400(res, msg.expiredOtp);
    }

    // Clear the reset code and expiration
    userData.reset_password_code = null;
    userData.reset_password_expires = null;
    await userData.save();

    return response200(res, msg.verificationSuccess);
});

// Reset Password 
const resetPassword = catchAsyncError(async (req, res) => {
    const { email, role, password } = req.body;

    let userData = await userService.check_user_exists({ email, user_type: role });
    if (!userData) return response400(res, msg.invalidCredentials);

    userData.password = hashPassword(password);;
    await userData.save();

    return response200(res, msg.resetPasswordSuccess);
});

//manage site setting
const manageSiteSetting = catchAsyncError(async (req, res) => {
    await commonService.manage_site_setting(req.body)
    return response200(res, msg.siteSettingSuccess);
});

// fetched site settings data
const fetchSiteSetting = catchAsyncError(async (req, res) => {
    const data = await commonService.fetch_site_setting()
    return response200(res, msg.fetchSuccessfully, data);
})


// fetch all invitations
const fetchInvitations = catchAsyncError(async (req, res) => {
    const added_by = req.admin || req.therapyCenter;
    const { search, status, page = 1, limit = 10 } = req.body;

    const invitations = await adminService.getInvitations({ added_by_id: added_by, search, status, page, limit });

    return response200(res, msg.invitationsFetched, invitations);
});

// delete invitation
const deleteInvitation = catchAsyncError(async (req, res) => {
    const id = req.params.id;
    const added_by = req.admin || req.therapyCenter;

    const result = await adminService.deleteInvitation(id, added_by);

    if (!result.success) {
        return response400(res, result.message);
    }
    return response200(res, result.message);
})


// update invitation details and send mail if email is updated
const updateInvitationDetails = catchAsyncError(async (req, res) => {
    const added_by = req.admin || req.therapyCenter;

    const { invitationId, name, email, type } = req.body;

    const invitation = await adminService.check_invitation({ id: invitationId });
    if (!invitation) return response400(res, msg.invitedCenterNotFound);

    if (invitation.added_by_id !== added_by) return response400(res, msg.invitationUpdateUnauthorized)
    if (invitation.status === invitation_status.Accepted) return response400(res, msg.updateNotAllow)


    const updatedData = { name: name || invitation.name };

    if (email && email !== invitation.email) {
        const checkInvitation = await adminService.check_invitation({ email, type })
        if (checkInvitation) return response400(res, msg.invitationAlreadySend);

        const checkUserExits = await userService.check_user_exists({ email, user_type: type })
        if (checkUserExits) return response400(res, msg.emailIsExists);

        const password = generateUniquePassword();
        const invitationLink = cryptoRandomString({ length: 32 });

        updatedData.email = email;
        updatedData.password = hashPassword(password);
        updatedData.invitation_link = invitationLink;
        updatedData.expires_at = Date.now() + 30 * 60 * 1000;

        if (type === "TherapyCentre") {
            await sendEmail({
                email,
                data: {
                    centerName: updatedData.name,
                    email,
                    password,
                    invitationLink: `${process.env.FRONT_URL}invitation/${invitationLink}`,
                },
                templateId: emailTemplates.therapyCenterInvitation,
            });
        } else {

            const centerDetails = await therapyCenterService.check_therapist_center({ id: invitation?.added_by_id })
            await sendEmail({
                email: email,
                data: { name: updatedData.name, email, centerName: centerDetails?.therapy_center_name, password, invitationLink: `${process.env.FRONT_URL}invitation/${invitationLink}` },
                templateId: emailTemplates.therapistInvitation
            });
        }
    }

    await adminService.update_invitation({ id: invitation.id }, updatedData);
    response200(res, msg.updateInvitationDetails, []);
});

// Resend invitation mail
const resendInvitationMail = catchAsyncError(async (req, res) => {
    const { email, type } = req.body

    const invitation = await adminService.check_invitation({ email, type })
    if (!invitation) return response400(res, msg.invitedCenterNotFound);

    if (invitation.status === invitation_status.Accepted) return response400(res, msg.resendNotAllow)

    const password = generateUniquePassword()
    req.body.password = hashPassword(password);
    req.body.invitation_link = cryptoRandomString({ length: 32 });
    req.body.expires_at = Date.now() + 30 * 60 * 1000;

    await adminService.update_invitation(
        { id: invitation.id },
        req.body
    )

    if (type === "TherapyCentre") {
        await sendEmail({
            email: email,
            data: { centerName: invitation.name, email, password, invitationLink: `${process.env.FRONT_URL}invitation/${req.body.invitation_link}` },
            templateId: emailTemplates.therapyCenterInvitation
        });
    } else {

        const centerDetails = await therapyCenterService.check_therapist_center({ id: invitation?.added_by_id })
        await sendEmail({
            email: email,
            data: { name: invitation.name, email, centerName: centerDetails?.therapy_center_name, password, invitationLink: `${process.env.FRONT_URL}invitation/${req.body.invitation_link}` },
            templateId: emailTemplates.therapistInvitation
        });
    }

    response200(res, msg.resendInvitationMail, [])
})

export {
    SignIn,
    forgotPassword,
    verifyCode,
    resetPassword,
    manageSiteSetting,
    fetchSiteSetting,
    fetchInvitations,
    deleteInvitation,
    updateInvitationDetails,
    resendInvitationMail
}
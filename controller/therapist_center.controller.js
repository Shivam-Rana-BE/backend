import { Op } from "sequelize";
import { response200, response201, response400 } from "../lib/response-messages/index.js";
import catchAsyncError from "../middleware/catchAsyncError.js";
import { adminService, commonService, therapistService, therapyCenterService, userService } from "../service/index.js";
import { emailTemplates, generateUniquePassword, hashPassword, invitation_status, msg, user_type, validatePassword } from "../utils/constant.js";
import sendEmail from "../utils/emailSender.js";
import { notificationText } from "../utils/notification.js";
import { deleteFromAzure, uploadToAzure } from "../lib/file-upload/index.js";
import cryptoRandomString from 'crypto-random-string';

const signupTherapistCenter = catchAsyncError(async (req, res) => {
    const { email, contact_number, password, therapy_center_name } = req.body;
    const isTherapistCenterExists = await userService.check_user_exists({ email, user_type: "TherapyCenter" });
    if (isTherapistCenterExists) return response400(res, msg.emailIsExists);

    const isContactNumberExists = await userService.check_user_exists({ phone_number: contact_number, user_type: user_type.TherapyCenter });
    if (isContactNumberExists) return response400(res, msg.contactNumberExists);

    req.body.password = hashPassword(password);
    const user = await userService.create_user({ email, password: req.body.password, name: therapy_center_name, phone_number: contact_number, user_type: user_type.TherapyCenter })
    const therapistCenterData = await therapyCenterService.create_therapist_center({ ...req.body, is_main_center: true, user_id: user?.id, is_profile_complete: true });

    const tokenPayload = { id: user.id, type: user_type.TherapyCenter }

    const token = await therapyCenterService.create_therapist_center_token(tokenPayload)
    const response = { role: user_type.TherapyCenter, token }

    const isWelcomeMailEnabled = await commonService.checkNotification(notificationText.welcomeMail)
    if (isWelcomeMailEnabled) await sendEmail({ email: email, data: { name: therapy_center_name }, templateId: emailTemplates.welcomeMail })


    return response201(res, msg.therapistCenterRegistered, response);
});

// center login via invitation, here we are added center in user and therapy center model
const loginViaInvitation = catchAsyncError(async (req, res) => {
    const { email, password, invitationLink } = req.body;

    const invitation = await adminService.check_invitation({ email })
    if (!invitation) return response400(res, msg.emailIsNotExits)

    if (!validatePassword(password, invitation.password))
        return response400(res, msg.invalidPassword);

    if (invitation.invitation_link !== invitationLink) return response400(res, msg.invalidInvitationLink)
    if (invitation.expires_at <= new Date()) return response400(res, msg.expiredInvitationLink);

    const userDetails = await userService.check_user_exists({ email, user_type: user_type.TherapyCenter })
    let tokenPayload = {}

    if (!userDetails) {
        let hashedPassword = hashPassword(password);
        const user = await userService.create_user({ email, password: hashedPassword, name: invitation.name, user_type: user_type.TherapyCenter })
        await therapyCenterService.create_therapist_center({ therapy_center_name: invitation.name, email, is_main_center: true, password: hashedPassword, user_id: user?.id });

        tokenPayload = { id: user.id, type: user_type.TherapyCenter }
        invitation.status = invitation_status.Accepted
        invitation.invitation_link = null
        await invitation.save()
    } else {
        tokenPayload = { id: userDetails.id, type: user_type.TherapyCenter }
    }

    const token = await therapyCenterService.create_therapist_center_token(tokenPayload)
    const response = { role: user_type.TherapyCenter, token, user_id: userDetails?.id }

    return response200(res, msg.loginSuccess, response);
});

// add sub branches of main  center
const addSubCenter = catchAsyncError(async (req, res) => {
    const { email, contact_number, master_center_id, therapy_center_name } = req.body;

    const masterCenter = await therapyCenterService.check_therapist_center({ id: master_center_id, isDeleted: false, is_main_center: true });
    if (!masterCenter) return response400(res, msg.masterCenterNotFound);

    const isTherapistCenterExists = await userService.check_user_exists({ email, user_type: "TherapyCenter" });
    if (isTherapistCenterExists) return response400(res, msg.emailIsExists);

    const isContactNumberExists = await userService.check_user_exists({ phone_number: contact_number, user_type: user_type.TherapyCenter });
    if (isContactNumberExists) return response400(res, msg.contactNumberExists);

    const password = generateUniquePassword()
    console.log('✌️password --->', password);
    req.body.password = hashPassword(password);
    const user = await userService.create_user({ email, password: req.body.password, name: therapy_center_name, phone_number: contact_number, user_type: user_type.TherapyCenter })
    const therapistCenterData = await therapyCenterService.create_therapist_center({ ...req.body, user_id: user?.id });
    return response201(res, msg.subCenterAddedSuccess, therapistCenterData);
});

// update profile
const updateCenterProfile = catchAsyncError(async (req, res) => {
    const therapyCenterId = req.therapyCenter;
    const { therapy_center_name, email, contact_number } = req.body;

    const center = await therapyCenterService.check_therapist_center({ id: therapyCenterId }, { attributes: { exclude: ['password', 'updatedAt'] } });
    if (!center) return response400(res, msg.centerDetailsNotFound)

    const isCenterExists = await therapyCenterService.check_therapist_center({ email, isDeleted: false, id: { [Op.ne]: therapyCenterId } });
    if (isCenterExists) return response400(res, msg.emailIsExists);

    const isPhoneNumberExists = await therapyCenterService.check_therapist_center({ contact_number, isDeleted: false, id: { [Op.ne]: therapyCenterId } });
    if (isPhoneNumberExists) return response400(res, msg.phoneNumberExists);

    if (req.file) {
        const file = await uploadToAzure("therapy-center", `${center.uuid}/profile`, req.file);
        const previousImagePath = center?.profile_image;
        req.body.profile_image = file.url;
        if (previousImagePath) await deleteFromAzure(previousImagePath)
    }

    await therapyCenterService.update_therapy_center({ id: therapyCenterId }, { ...req.body, is_profile_complete: true });
    await userService.update_user({ id: center?.user_id }, { email, phone_number: contact_number, name: therapy_center_name });

    return response200(res, msg.profileUpdated, []);
});

// link therapist to therapy center
const addTherapist = catchAsyncError(async (req, res) => {
    const centerId = req.therapyCenter;
    const { email } = req.body;

    // Check if the user already exists
    const existingUser = await userService.check_user_exists({ email, user_type: user_type.Therapist });

    let existingTherapist;
    if (existingUser) {
        // Check if the user is already registered as a therapist
        existingTherapist = await therapistService.check_therapist({ user_id: existingUser.id, isDeleted: false });
    }

    // If therapist exists, check if they are already linked to the center
    if (existingTherapist) {
        const isLinked = await therapyCenterService.check_center_therapist_link({
            center_id: centerId,
            therapist_id: existingTherapist.id,
            isDeleted: false
        });

        if (isLinked) return response400(res, msg.therapistIsAlreadyLinked);

        // Link the therapist to the center
        await therapyCenterService.create_center_therapist_link({ center_id: centerId, therapist_id: existingTherapist.id });

    } else {
        // If therapist does not exist, create a new user and therapist
        const plainPassword = generateUniquePassword();
        const hashedPassword = hashPassword(plainPassword);

        // Create new user with the Therapist role
        const newUser = await userService.create_user({
            ...req.body,
            password: hashedPassword,
            user_type: user_type.Therapist
        });

        // Create the therapist profile linked to the new user
        const newTherapist = await therapistService.create_therapist({ ...req.body, user_id: newUser.id });

        // Link the new therapist to the center
        await therapyCenterService.create_center_therapist_link({ center_id: centerId, therapist_id: newTherapist.id });

        // Optionally, send an email with the plain password to the therapist (if required)
        // await emailService.sendWelcomeEmail({ email, password: plainPassword });
    }
    return response201(res, msg.therapistAddedSuccess);
});

const inviteTherapist = catchAsyncError(async (req, res) => {
    const centerId = req.therapyCenter;
    const { email, name } = req.body;

    const centerDetails = await therapyCenterService.check_therapist_center({ id: centerId })
    if (!centerDetails) return response400(res, msg.centerDetailsNotFound)

    if (centerDetails.is_profile_complete === false) return response400(res, msg.needToCompleteProfile)

    // Check if the user already exists
    const existingUser = await userService.check_user_exists({ email, user_type: user_type.Therapist });

    let existingTherapist;
    if (existingUser) {
        // Check if the user is already registered as a therapist
        existingTherapist = await therapistService.check_therapist({ user_id: existingUser.id, isDeleted: false });
    }

    // If therapist exists, check if they are already linked to the center
    if (existingTherapist) {
        const isLinked = await therapyCenterService.check_center_therapist_link({
            center_id: centerId,
            therapist_id: existingTherapist.id,
            isDeleted: false
        });

        if (isLinked) return response200(res, msg.therapistIsAlreadyLinked);

        // Link the therapist to the center
        await therapyCenterService.create_center_therapist_link({ center_id: centerId, therapist_id: existingTherapist.id });
        await sendEmail({
            email: email,
            data: { name, centerName: centerDetails.therapy_center_name, platformLink: process.env.FRONT_URL },
            templateId: emailTemplates.therapistLinkToCenter
        });
        return response200(res, msg.invitationSend);
    } else {
        // If therapist does not exist, send invitation
        const checkInvitation = await adminService.check_invitation({ email, type: user_type.Therapist, added_by_id: centerId })
        if (checkInvitation) return response400(res, msg.invitationAlreadySend);

        const password = generateUniquePassword()
        req.body.password = hashPassword(password);
        req.body.invitation_link = cryptoRandomString({ length: 32 });
        req.body.expires_at = Date.now() + 30 * 60 * 1000;

        await adminService.create_invitation({
            ...req.body, added_by_id: centerId, added_by_type:
                "TherapyCenter", type: user_type.Therapist
        })

        await sendEmail({
            email: email,
            data: { name, email, centerName: centerDetails.therapy_center_name, password, invitationLink: `${process.env.FRONT_URL}invitation/${req.body.invitation_link}` },
            templateId: emailTemplates.therapistInvitation
        });

        response200(res, msg.invitationSend, [])

    }
    // return response200(res, msg.therapistAddedSuccess);
});

// get linked therapist list to center
const getCenterTherapist = catchAsyncError(async (req, res) => {
    const centerId = req.therapyCenter;
    const data = await therapyCenterService.get_link_therapists({ isDeleted: false, center_id: centerId, status: invitation_status.Accepted }, req.query)
    return response200(res, msg.fetchSuccessfully, data);
});

// manage linked therapist status
const manageTherapistStatus = catchAsyncError(async (req, res) => {
    const centerId = req.therapyCenter;
    const { therapist_id, is_active } = req.body;

    const therapistLink = await therapyCenterService.check_center_therapist_link({ center_id: centerId, therapist_id });
    if (!therapistLink) return response400(res, msg.therapistNotLinked);

    await therapyCenterService.update_center_therapist_link({ center_id: centerId, therapist_id }, { is_active });
    return response200(res, msg.therapistStatusUpdated, []);
});

// delete therapist from center only
const deleteTherapistFromCenter = catchAsyncError(async (req, res) => {
    const centerId = req.therapyCenter;
    const { therapist_id } = req.params;

    const therapistLink = await therapyCenterService.check_center_therapist_link({ center_id: centerId, therapist_id });
    if (!therapistLink) return response400(res, msg.therapistNotLinked);

    await therapyCenterService.update_center_therapist_link({ center_id: centerId, therapist_id }, { isDeleted: true });
    return response200(res, msg.therapistDeletedFromCenter, []);
});

const fetchProfile = async (req, res) => {
    const userId = req.user;
    const profile = await therapyCenterService.get_therapy_centerProfile(userId);
    if (!profile) {
        return response400(res, msg.profileNotFound);
    }
    return response200(res, msg.fetchSuccessfully, profile);

};

const getTherapistDetails = async (req, res) => {

    const { therapist_id } = req.params;
    const therapist = await therapyCenterService.get_therapist_details(therapist_id);
    if (!therapist) {
        return response400(res, msg.therapistNotFound);
    }
    return response200(res, msg.fetchSuccessfully, therapist);

};




export {
    signupTherapistCenter,
    loginViaInvitation,
    addSubCenter,
    addTherapist,
    inviteTherapist,
    getCenterTherapist,
    manageTherapistStatus,
    deleteTherapistFromCenter,
    fetchProfile,
    updateCenterProfile,
    getTherapistDetails
}
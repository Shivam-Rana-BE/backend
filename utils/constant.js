import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const msg = {
    tokenRequiredErr: "Please login to access this resource",
    invalidCredentials: "Invalid credentials",
    emailIsNotExits: "Email is not exits",
    emailIsRequired: "Email is required",
    loginSuccess: "Login successfully",
    invalidRole: "Invalid role",
    parentRegistered: "Parent registered successfully",
    addChildSuccess: "Child details added successfully",
    therapistCenterRegistered: "Therapist center registered successfully",
    subCenterAddedSuccess: "Therapy center added successfully",
    therapistRegistered: "Therapist registered successfully",
    invalidToken: "Invalid Token",
    tokenExpired: "Token is expired or Invalid",
    accountInActivated: "Your account has been deactivated by the administrator.",
    accountSuspended: "Your account has been suspended by the administrator.",
    emailIsExists: "This email is already register with us.",
    phoneNumberExists: "Phone Number is already exists",
    contactNumberExists: "Contact number is already exists",
    profileUpdated: "Profile updated successfully",
    oldPasswordIsNotMatched: "Old password is not matched",
    passwordUpdateSuccess: "Password updated successfully",
    fetchSuccessfully: "Fetched successfully",
    childDeleteSuccess: "Child removed successfully",
    childDataNotExists: "Child is not exists",
    fetch_success: "Fetched successfully",
    kid_not_found: "Kid not found",
    centerDetailsNotFound: "Therapy center details not found",
    status_update_success: "Status updated successfully",
    status_update_failure: "Kid not found or unable to update status",
    invalid_id_format: "Invalid ID format",
    error_toggling_status: "Error toggling kid status",
    invalidParentKid: "The parent does not correspond to this child.",
    kidDetailsUpdated: "Kid details updated successfully",
    mainSendSuccess: "Email send successfully.",
    invalidOtp: "Invalid OTP.",
    expiredOtp: "The OTP has expired. Please request a new one.",
    verificationSuccess: "Verification done successfully.",
    resetPasswordSuccess: "Password change successfully.",
    siteSettingSuccess: "Site setting stored successfully.",
    questionExits: "This question is already added",
    questionNotExits: "Question details not found",
    questionIconRequired: "Question icon is required",
    addQuestionSuccess: "Question added successfully",
    updateQuestionSuccess: "Question updated successfully",
    ansAlreadySubmit: "This questions answer is already submitted",
    ansSubmittedSuccess: "Answer submitted successfully",
    milestoneDeleteSuccess: "Question removed successfully",
    masterCenterNotFound: "Master therapy center not found",
    therapistIsAlreadyLinked: "This therapist is already link to this center",
    therapistAddedSuccess: "Therapist added successfully",
    therapistNotLinked: "The therapist is not linked to the therapy center.",
    therapistStatusUpdated: "Therapist status has been updated successfully.",
    therapistDeletedFromCenter: "Therapist has been successfully deleted from the center.",
    categoryCreated: 'Category successfully created.',
    categoryUpdated: 'Category successfully updated.',
    categoryDeleted: 'Category successfully deleted.',
    categoryNotFound: 'Category not found.',
    categoryNameExists: 'Category name already exists.',
    socketUpdateSuccess: "Socket id updated successfully",
    groupCreatedSuccess: "Group created successfully",
    socketIdRequired: "Socket id is required",
    userNotFound: "User details not found",
    groupIdRequired: "Group id is required",
    resetCountSuccess: "Unread count reset successfully",
    receiverIdRequired: "Receiver id is required",
    failToCreateGroup: "Failed to create the group.",
    groupMemberFetched: "Group members fetched successfully.",
    noMemberFetched: "Members not found.",
    memberDetailsNotfound: "User is not member of this group",
    therapistFound: 'Therapists fetched successfully',
    invitationAlreadySend: 'Invitation already sent to this email.',
    invitationSend: 'Invitation send successfully',
    invitationsFetched: 'Invitations fetched successfully',
    invitationNotFound: 'Invitation not found',
    invitationDeleteUnauthorized: 'You are not authorized to delete this invitation.',
    invitationUpdateUnauthorized: 'You are not authorized to update this invitation.',
    updateNotAllow: 'Update not allowed for accepted invitations.',
    resendNotAllow: 'Resending email is not allowed for accepted invitations.',
    invitationDeleted: 'Invitation deleted successfully.',
    invitedCenterNotFound: 'Invitation details not found',
    resendInvitationMail: 'Invitation email resent successfully.',
    updateInvitationDetails: 'Invitation details updated successfully.',
    userDeleted: 'User deleted successfully.',
    profileNotFound: 'Profile not found',
    invalidInvitationLink: 'Invalid invitation link.',
    expiredInvitationLink: "The invitation link has expired. Please request a new one.",
    invalidPassword: "Invalid Password",
    therapistLinked: "Therapist linked successfully.",
    therapistNotFound: 'Therapist not found',
    needToCompleteProfile: "You need to complete your profile before inviting a therapist.",
    invitationLinkRequired: "Invitation link is required",
    therapistLinkDetailsNotFound: "Therapist linked details not found",
}

const max_file_size = 15;

const modelName = {
    USER: 'User',
    PARENT: 'Parent',
    KID: 'Kid',
    THERAPIST: 'Therapist',
    ATTACHMENT: 'Attachment',
    THERAPIST_CENTER: 'TherapistCenter',
    SITE_SETTING: 'SiteSetting',
    ADMIN: "Admin",
    MILESTONE_QUESTION: "MilestoneQuestions",
    KID_MILESTONE: "KidMilestone",
    CENTER_THERAPIST_LINK: "CenterTherapistLink",
    THERAPIST_CATEGORY: "TherapistCategory",
    GROUP: "Groups",
    GROUP_MEMBER: "GroupMember",
    MESSAGE: "Messages",
    MESSAGE_ATTACHMENT: "MessageAttachments",
    INVITATION: 'Invitation'
};

const gender = {
    male: "male",
    female: "female",
}

const invitation_status = {
    Pending: "pending",
    Accepted: "accepted",
    Rejected: "rejected"
}

const chat_type = {
    Direct: "direct",
    Group: "group"
}

const language = {
    English: 'English',
}

const user_type = {
    Parent: 'Parent',
    Kid: 'Kid',
    Therapist: 'Therapist',
    TherapyCenter: 'TherapyCenter',
    Admin: "Admin"
}

const validatePassword = (inputPassword, storedPassword) => {
    return bcrypt.compareSync(inputPassword, storedPassword);
};

const generateUniquePassword = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*';

    const password = [
        alphabet[Math.floor(Math.random() * alphabet.length)],
        numbers[Math.floor(Math.random() * numbers.length)],
        specialChars[Math.floor(Math.random() * specialChars.length)],
        ...Array.from({ length: 5 }, () => {
            const allChars = alphabet + numbers + specialChars;
            return allChars[Math.floor(Math.random() * allChars.length)];
        })
    ];
    return password.sort(() => 0.5 - Math.random()).join('');
}

const hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};
const generateUid = () => {
    return uuidv4().replace(/-/g, '').slice(0, 8);
};

const generateOtp = () => {
    const digit = "0123456789"
    let OTP = ''
    for (let i = 0; i < 4; i++) {
        OTP += digit[Math.floor(Math.random() * 10)]
    }

    const resetPasswordTokenExpires = Date.now() + 15 * 60 * 1000;
    return { OTP, resetPasswordTokenExpires }
};
const account_status = {
    Active: 'Active',
    Inactive: 'Inactive',
    Suspended: 'Suspended'
}

const emailTemplates = {
    forgotPassword: "d-930c03fca79a4064b144731292164a5f",
    welcomeMail: "d-712ca265371848adb0328b8e36ce9535",
    therapyCenterInvitation: "d-c0d69c9db20746e285bb1f83ae3653bc",
    therapistInvitation: "d-5b8d73527de3448b880b67ab172ffd95",
    therapistLinkToCenter: "d-38f8b956adab4b34806d2ac8bdb93a36"
}

export {
    msg,
    max_file_size,
    modelName,
    gender,
    language,
    user_type,
    account_status,
    invitation_status,
    validatePassword,
    generateUniquePassword,
    hashPassword,
    generateUid,
    generateOtp,
    emailTemplates,
    chat_type
}

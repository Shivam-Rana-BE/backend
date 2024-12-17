import catchAsyncError from "../middleware/catchAsyncError.js";
import { response200, response201, response400 } from "../lib/response-messages/index.js";
import { commonService, parentService, userService } from "../service/index.js";
import { emailTemplates, hashPassword, user_type, validatePassword } from "../utils/constant.js";
import { deleteFromAzure, uploadToAzure } from "../lib/file-upload/index.js";
import { msg } from "../utils/constant.js";
import sendEmail from "../utils/emailSender.js";
import { notificationText } from "../utils/notification.js";

// parent signup
const parentSignup = catchAsyncError(async (req, res) => {
  const { email, password, phone_number, name } = req.body;

  const isParentExists = await userService.check_user_exists({ email, user_type: user_type.Parent });
  if (isParentExists) return response400(res, msg.emailIsExists);

  if (phone_number) {
    const isPhoneNumberExists = await userService.check_user_exists({ phone_number, user_type: user_type.Parent });
    if (isPhoneNumberExists) return response400(res, msg.phoneNumberExists);
  }

  req.body.password = hashPassword(password);
  req.body.isProfileComplete = true;

  const user = await userService.create_user({ email, password: req.body.password, name, phone_number, user_type: user_type.Parent })

  const parentData = await parentService.create_parent({ ...req.body, user_id: user?.id });

  const tokenPayload = { id: user.id, type: user_type.Parent }

  const token = await parentService.create_parent_token(tokenPayload)
  const response = {
    role: user_type.Parent,
    hasChildProfile: parentData.hasChildProfile,
    isProfileComplete: parentData.isProfileComplete,
    token,
  }
  const isWelcomeMailEnabled = await commonService.checkNotification(notificationText.welcomeMail)
  if (isWelcomeMailEnabled) await sendEmail({ email: email, data: { name }, templateId: emailTemplates.welcomeMail })

  return response201(res, msg.parentRegistered, response);
});


const getProfile = catchAsyncError(async (req, res) => {
  const parentId = req.parent;

  const data = await parentService.get_single_parent({ id: parentId }, { attributes: { exclude: ['password', 'updatedAt'] } });

  return response200(res, msg.fetchSuccessfully, data);
});

const updateProfile = catchAsyncError(async (req, res) => {
  const parentId = req.parent;
  const { email, phone_number, name } = req.body;

  const parent = await parentService.get_single_parent({ id: parentId }, { attributes: { exclude: ['password', 'updatedAt'] } });

  if (email) {
    const isParentExists = await parentService.check_other_parent_exists(parentId, { email, isDeleted: false });
    if (isParentExists) return response400(res, msg.emailIsExists);
  }

  if (phone_number) {
    const isPhoneNumberExists = await parentService.check_other_parent_exists(parentId, { phone_number, isDeleted: false });
    if (isPhoneNumberExists) return response400(res, msg.phoneNumberExists);
  }

  if (req.file) {
    const file = await uploadToAzure("parent", `${parent.uuid}/profile`, req.file);
    const previousImagePath = parent?.profile_image;
    req.body.profile_image = file.url;
    if (previousImagePath) await deleteFromAzure(previousImagePath)
  }

  await parentService.update_parent({ id: parentId }, req.body);
  await userService.update_user({ id: parent?.user_id }, { email, phone_number, name });

  return response200(res, msg.profileUpdated, []);
});

const changePassword = catchAsyncError(async (req, res) => {
  const parentId = req.user;
  const { oldPassword, newPassword } = req.body;

  const parentData = await userService.check_user_exists({ id: parentId });

  const validPassword = validatePassword(oldPassword, parentData.password);

  if (!validPassword) return response400(res, msg.oldPasswordIsNotMatched);

  req.body.password = hashPassword(newPassword);

  await userService.update_user({ id: parentId }, { password: req.body.password });

  return response200(res, msg.passwordUpdateSuccess, []);
});

const getKidList = catchAsyncError(async (req, res) => {
  const parentId = req.parent;
  const childData = await parentService.get_child_list({ parent_id: parentId, isDeleted: false },);

  return response200(res, msg.fetchSuccessfully, childData);
});

export { parentSignup, getProfile, updateProfile, changePassword, getKidList }
import catchAsyncError from "../middleware/catchAsyncError.js";
import { response200, response201, response400 } from "../lib/response-messages/index.js";
import { adminService, parentService, therapistCategoryService, therapistService, therapyCenterService, userService } from "../service/index.js";
import { emailTemplates, generateUniquePassword, hashPassword, msg, user_type, validatePassword } from "../utils/constant.js";
import { deleteFromAzure, uploadToAzure } from "../lib/file-upload/index.js";
import { Op } from "sequelize";
import token_manager from "../lib/token_manager.js";
import cryptoRandomString from 'crypto-random-string';
import sendEmail from "../utils/emailSender.js";

// admin login
const adminLogin = catchAsyncError(async (req, res) => {
  const { email, password, role } = req.body;

  let userData = await adminService.check_admin({ email, isDeleted: false, });
  if (!userData) return response400(res, msg.invalidCredentials);

  if (!validatePassword(password, userData.password))
    return response400(res, msg.invalidCredentials);

  let token = await token_manager.create_token({ id: userData.id, type: role });
  return response200(res, msg.loginSuccess, { role, token, userId: userData?.id });
});

// add milestone question
const addMilestoneQuestion = catchAsyncError(async (req, res) => {
  const adminId = req.admin;
  const { question } = req.body

  const isQueExits = await adminService.check_milestone_question({ question })
  if (isQueExits) return response400(res, msg.questionExits)

  const icon = await uploadToAzure("admin", "milestone-questions", req.file);

  const data = await adminService.create_milestone_que({ question, que_icon: icon.url, added_by: adminId });
  return response201(res, msg.addQuestionSuccess, data);
});

// update milestone question
const updateMilestoneQuestions = catchAsyncError(async (req, res) => {
  const { questionId, question } = req.body

  const isQueExits = await adminService.check_milestone_question({ id: questionId, isDeleted: false })
  if (!isQueExits) return response400(res, msg.questionNotExits)

  if (question) {
    const isQueExits = await adminService.check_milestone_question({ question, id: { [Op.ne]: questionId } })
    if (isQueExits) return response400(res, msg.questionExits)
  }

  if (req.file) {
    const file = await uploadToAzure("admin", "milestone-questions", req.file);
    const previousImagePath = isQueExits?.que_icon;
    req.body.que_icon = file.url;
    if (previousImagePath) await deleteFromAzure(previousImagePath)
  }

  await adminService.update_milestone({ id: questionId }, req.body);
  return response200(res, msg.updateQuestionSuccess, []);
});

// add milestone question
const getMilestoneQuestions = catchAsyncError(async (req, res) => {
  const data = await adminService.get_milestone_que({ isDeleted: false }, req.query)
  return response200(res, msg.fetch_success, data);
});

// remove milestone question
const removeMilestoneQuestion = catchAsyncError(async (req, res) => {
  const { questionId } = req.params;

  const isQueExits = await adminService.check_milestone_question({ id: questionId, isDeleted: false })
  if (!isQueExits) return response400(res, msg.questionNotExits)

  await adminService.update_milestone({ id: questionId }, { isDeleted: true });

  return response200(res, msg.milestoneDeleteSuccess, []);
});

// get all therapist center list
const getAllTherapistCenter = catchAsyncError(async (req, res) => {
  const data = await adminService.fetch_therapist_center(req.query)
  return response200(res, msg.fetch_success, data);
});

// get all kid of single parent
const getAllKidOfParent = catchAsyncError(async (req, res) => {
  let parentId = req.params.parentId
  const data = await parentService.get_child_list({ parent_id: parentId, isDeleted: false },);
  return response200(res, msg.fetch_success, data);
})

// get all parents list
const getAllParents = catchAsyncError(async (req, res) => {
  const data = await adminService.fetchParents(req.query);
  return response200(res, msg.fetch_success, data);
});

// get all kids list
const getAllKids = catchAsyncError(async (req, res) => {
  const data = await adminService.fetchKids(req.query);
  return response200(res, msg.fetch_success, data);
});

// Create Therapist Category
const addTherapistCategory = catchAsyncError(async (req, res) => {
  const { name } = req.body;
  const existingCategory = await therapistCategoryService.check_category({ name, isDeleted: false });

  if (existingCategory) {
    return response400(res, msg.categoryNameExists);
  }
  const category = await therapistCategoryService.create_therapist_category({ name });
  return response200(res, msg.categoryCreated, category);
});

// Get All Categories
const getAllTherapistCategories = catchAsyncError(async (req, res) => {
  const categories = await therapistCategoryService.get_all_therapist_categories({ isDeleted: false });
  return response200(res, msg.success, categories);
});

// Update Therapist Category
const updateTherapistCategory = catchAsyncError(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const existingCategory = await therapistCategoryService.get_therapist_category_by_id(id);
  if (!existingCategory) return response400(res, msg.categoryNotFound);

  const existingNameCategory = await therapistCategoryService.check_category({
    name,
    isDeleted: false,
    id: { [Op.ne]: id }
  });

  if (existingNameCategory) return response400(res, msg.categoryNameExists);

  await therapistCategoryService.update_therapist_category(id, { name });
  return response200(res, msg.categoryUpdated, []);
});

// Delete (Soft Delete) Therapist Category
const deleteTherapistCategory = catchAsyncError(async (req, res) => {
  const { id } = req.params;
  const existingCategory = await therapistCategoryService.get_therapist_category_by_id(id);
  if (!existingCategory) {
    return response400(res, msg.categoryNotFound);
  }
  await therapistCategoryService.delete_therapist_category(id);
  return response200(res, msg.categoryDeleted);
});

//invite therapy center by admin manage send mail functionality
const inviteTherapyCenter = catchAsyncError(async (req, res) => {
  const adminId = req.admin;
  const { name, email } = req.body

  const checkInvitation = await adminService.check_invitation({ email, type: user_type.TherapyCenter })
  if (checkInvitation) return response400(res, msg.invitationAlreadySend);

  const checkUserExits = await userService.check_user_exists({ email, user_type: user_type.TherapyCenter })
  if (checkUserExits) return response400(res, msg.emailIsExists);

  const password = generateUniquePassword()
  req.body.password = hashPassword(password);
  req.body.invitation_link = cryptoRandomString({ length: 32 });
  req.body.expires_at = Date.now() + 30 * 60 * 1000;

  await adminService.create_invitation({
    ...req.body, added_by_id: adminId, added_by_type:
      "Admin", type: "TherapyCenter"
  })
  await sendEmail({
    email: email,
    data: { centerName: name, email, password, invitationLink: `${process.env.FRONT_URL}invitation/${req.body.invitation_link}` },
    templateId: emailTemplates.therapyCenterInvitation
  });

  response200(res, msg.invitationSend, [])
})

// Manage user account status
const changeUserStatus = catchAsyncError(async (req, res) => {
  const { userId, status } = req.body;

  const user = await userService.check_user_exists({ id: userId });
  if (!user) return response400(res, msg.userNotFound);

  await userService.update_user({ id: userId }, { account_status: status });
  return response200(res, msg.status_update_success, []);
});

// delete user account (soft delete)
const deleteUser = catchAsyncError(async (req, res) => {
  const { userId } = req.params;

  const user = await userService.check_user_exists({ id: userId });
  if (!user) return response400(res, msg.userNotFound);

  await userService.update_user({ id: userId }, { isDeleted: true });

  switch (user.user_type) {
    case user_type.Parent:
      await parentService.update_parent({ user_id: userId }, { isDeleted: true });
      break;

    case user_type.Therapist:
      await therapistService.update_therapist({ user_id: userId }, { isDeleted: true });
      break;

    case user_type.TherapyCenter:
      await therapyCenterService.update_therapy_center({ user_id: userId }, { isDeleted: true });
      break;
    default:

  }
  return response200(res, msg.userDeleted, []);
});

// manage therapy center availability
const manageAvailability = catchAsyncError(async (req, res) => {
  const { userId, status } = req.body;

  const user = await userService.check_user_exists({ id: userId });
  if (!user) return response400(res, msg.userNotFound);

  await therapyCenterService.update_therapy_center({ user_id: userId }, { is_available: status });
  return response200(res, msg.status_update_success, []);
});


// update therapy center details
const updateCenterDetails = catchAsyncError(async (req, res) => {
  const { userId, therapy_center_name } = req.body;

  const user = await userService.check_user_exists({ id: userId });
  if (!user) return response400(res, msg.userNotFound);

  await therapyCenterService.update_therapy_center({ user_id: userId }, req.body);

  if (therapy_center_name && therapy_center_name !== user.name) {
    await userService.update_user({ id: userId }, { name: therapy_center_name });
  }
  return response200(res, msg.profileUpdated, []);
});

export {
  addMilestoneQuestion,
  updateMilestoneQuestions,
  getMilestoneQuestions,
  removeMilestoneQuestion,
  getAllTherapistCenter,
  getAllKidOfParent,
  getAllParents,
  getAllKids,
  addTherapistCategory,
  getAllTherapistCategories,
  updateTherapistCategory,
  deleteTherapistCategory,
  adminLogin,
  inviteTherapyCenter,
  changeUserStatus,
  deleteUser,
  manageAvailability,
  updateCenterDetails
};

import catchAsyncError from "../middleware/catchAsyncError.js";
import { response200, response201, response400 } from "../lib/response-messages/index.js";
import { adminService, kidService, parentService } from "../service/index.js";
import { msg } from "../utils/constant.js";
import { deleteFromAzure, uploadToAzure } from "../lib/file-upload/index.js";
import { Op } from 'sequelize';

// add kid
const addKid = catchAsyncError(async (req, res) => {
    const parentId = req.parent;

    req.body.parent_id = parentId;
    if (req.files && !req.files?.profile_image?.length) return response400(res, "Profile image is required")

    const uploadedFiles = [];
    if (req.files && req.files?.attachments?.length > 0) {
        for (const file of req.files.attachments) {
            const fileUrl = await uploadToAzure("parent", `${req.uuid}/child-documents`, file);
            uploadedFiles.push(fileUrl);
        }
    }

    let profileImage = await uploadToAzure("parent", `${req.uuid}/child-documents`, req.files.profile_image[0]);

    const parentData = await parentService.get_single_parent({ id: parentId, isDeleted: false }, {});
    const childData = await parentService.create_child({ ...req.body, profile_image: profileImage.url });

    if (childData && uploadedFiles?.length) {
        Promise.all(uploadedFiles.map(async (val) => {
            await kidService.add_attachment({ parent_id: parentId, kid_id: childData.id, file_type: val.type, file_url: val.url })
        }))
    }

    if (childData && !parentData.hasChildProfile) {
        await parentService.update_parent({ id: parentId }, { hasChildProfile: true });
    }

    return response201(res, msg.addChildSuccess, childData);
});

// get kid data
const getKid = catchAsyncError(async (req, res) => {
    const kidId = req.params.id;
    const kid = await kidService.get_kid_by_id(kidId, { attributes: { exclude: ['isDeleted', 'updatedAt'] } });

    if (!kid) {
        return response400(res, msg.kid_not_found);
    }

    return response200(res, msg.fetch_success, kid);
});

// change kid status
const changeKidStatus = catchAsyncError(async (req, res) => {
    const { id, status } = req.body;
    const kid = await kidService.get_kid_by_id(id);

    if (!kid) return response400(res, msg.kid_not_found);

    if (kid.parent_id !== req.parent) return response400(res, msg.invalidParentKid);

    await kidService.set_kid_status(kid, status);

    return response200(res, msg.status_update_success, []);
});

// remove kid
const removeKid = catchAsyncError(async (req, res) => {
    const parentId = req.parent;
    const childId = req.params.id;

    const childData = await kidService.child_exists({ id: childId, isDeleted: false });
    if (!childData) return response400(res, msg.childDataNotExists);

    await kidService.update_child({ id: childId }, { isDeleted: true });

    return response200(res, msg.childDeleteSuccess, []);
})

// update kid profile
const updateKid = catchAsyncError(async (req, res) => {
    const parentId = req.parent;
    const { kidId, removeAttachments } = req.body;

    const kid = await kidService.child_exists(
        { id: kidId, parent_id: parentId },
        { attributes: { exclude: ['isDeleted', 'updatedAt'] } }
    );
    if (!kid) return response400(res, msg.invalidParentKid);


    const uploadedFiles = [];
    // Handle multiple attachments upload
    if (req.files?.attachments?.length) {
        const uploadPromises = req.files.attachments.map(async (file) => {
            const fileUrl = await uploadToAzure("parent", `${req.uuid}/child-documents`, file);
            uploadedFiles.push(fileUrl);
        });
        await Promise.all(uploadPromises);
    }

    // Handle profile image upload
    if (req.files?.profile_image?.length) {
        const profileImageFile = req.files.profile_image[0];
        const newImageUrl = await uploadToAzure("parent", `${req.uuid}/child-documents`, profileImageFile);
        if (kid.profile_image) await deleteFromAzure(kid.profile_image);
        req.body.profile_image = newImageUrl.url;
    }


    await kidService.update_child({ id: kidId }, req.body);

    if (uploadedFiles.length) {
        const attachmentPromises = uploadedFiles.map(async (file) => {
            await kidService.add_attachment({
                parent_id: parentId,
                kid_id: kidId,
                file_type: file.type,
                file_url: file.url
            });
        });
        await Promise.all(attachmentPromises);
    }

    // Handle removal of attachments
    if (removeAttachments?.length) {
        const removalPromises = removeAttachments.map(async (fileId) => {
            const attachmentData = await kidService.get_attachment({ id: fileId });
            if (attachmentData) {
                await kidService.delete_attachment({ kid_id: kidId, id: fileId });
                await deleteFromAzure(attachmentData.file_url);
            }
        });
        await Promise.all(removalPromises);
    }
    return response200(res, msg.kidDetailsUpdated, []);
});

// submit milestone answer
const submitMilestoneAnswer = catchAsyncError(async (req, res) => {
    const parentId = req.parent;
    const { kidId, questionId, answer, } = req.body

    const kidExists = await kidService.child_exists({ id: kidId, parent_id: parentId });
    if (!kidExists) return response400(res, msg.invalidParentKid);

    const questionExists = await adminService.check_milestone_question({ id: questionId })
    if (!questionExists) return response400(res, msg.questionNotExits);

    const alreadySubmitted = await kidService.kid_milestone_check({ kid_id: kidId, question_id: questionId })
    if (alreadySubmitted) return response400(res, msg.ansAlreadySubmit);

    const data = await kidService.store_kid_milestone({ kid_id: kidId, parent_id: parentId, question_id: questionId, answer })
    return response200(res, msg.ansSubmittedSuccess, data);
});

// get pending milestone questions
const getPendingMilestoneQuestions = catchAsyncError(async (req, res) => {
    const parentId = req.parent;
    const { kidId } = req.params

    let submittedQuestions = await kidService.fetch_submitted_questions({ kid_id: kidId, parent_id: parentId })
    submittedQuestions = submittedQuestions.map((val) => val?.question.id)

    const { data, totalCount } = await kidService.fetch_pending_questions({
        isDeleted: false,
        id: { [Op.notIn]: submittedQuestions }
    });

    return response200(res, msg.fetch_success, { totalCount, submittedCount: submittedQuestions.length, data });
});

// get milestone activity
const getMilestoneActivity = catchAsyncError(async (req, res) => {
    const parentId = req.parent;
    const { kidId } = req.params

    let data = await kidService.fetch_submitted_questions({ kid_id: kidId, parent_id: parentId })

    return response200(res, msg.fetch_success, data);
});

export {
    addKid,
    getKid,
    changeKidStatus,
    removeKid,
    updateKid,
    submitMilestoneAnswer,
    getPendingMilestoneQuestions,
    getMilestoneActivity
};

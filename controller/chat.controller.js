import { response200, response400 } from "../lib/response-messages/index.js";
import catchAsyncError from "../middleware/catchAsyncError.js";
import { chatService, userService } from "../service/index.js";
import { msg, } from "../utils/constant.js";

// not in use
const updateSocketId = catchAsyncError(async (req, res) => {
    const userId = req.user
    const { socket_id } = req.body;
    if (!socket_id) return response400(res, msg.socketIdRequired)

    await userService.update_user({ id: userId }, { socket_id, is_online: true })
    return response200(res, msg.socketUpdateSuccess, []);
})

const checkGroup = catchAsyncError(async (req, res) => {
    const userId = req.user
    const { receiverId } = req.body;
    if (!receiverId) return response400(res, msg.receiverIdRequired)

    const groupId = await chatService.check_group({ userId, receiverId })
    return response200(res, msg.fetch_success, { groupId });
});

const createPrivateGroup = catchAsyncError(async (req, res) => {
    const userId = req.user
    const { receiverId } = req.body;
    if (!receiverId) return response400(res, msg.receiverIdRequired)

    const user = await userService.check_user_exists({ id: receiverId })
    if (!user) return response400(res, msg.userNotFound)

    const groupId = await chatService.check_group({ userId, receiverId })
    let data
    if (groupId) {
        data = await chatService.find_group_member(groupId)
    } else {
        data = await chatService.create_direct_group({ userId, receiverId })
    }

    const result = await chatService.fetch_group_details(data[0]?.group_id, userId)
    return response200(res, msg.groupCreatedSuccess, result);
});


const createTeamGroup = catchAsyncError(async (req, res) => {
    const userId = req.user
    const { members, groupName } = req.body;

    let data = await chatService.create_team_group({ userId, members, groupName, file: req.file })
    const result = await chatService.fetch_group_details(data[0]?.group_id, userId)
    return response200(res, msg.groupCreatedSuccess, result);
});

const resetUnreadCount = catchAsyncError(async (req, res) => {
    const userId = req.user
    const { groupId } = req.body;
    if (!groupId) return response400(res, msg.groupIdRequired)

    const group = await chatService.check_member({ user_id: userId, group_id: groupId })
    if (!group) return response400(res, msg.memberDetailsNotfound)

    await chatService.reset_unread_counts(userId, groupId)
    return response200(res, msg.resetCountSuccess);
});

const fetchMyGroups = catchAsyncError(async (req, res) => {
    const userId = req.user
    const { page, limit, type, search } = req.body;
    const data = await chatService.fetch_sidebar_data({ page, limit, type, search, userId })

    return response200(res, msg.fetchSuccessfully, data);
});

const fetchGroupMembers = catchAsyncError(async (req, res) => {
    const userId = req.user
    const { groupId, name } = req.body;

    const members = await chatService.getGroupMembers(groupId, name, userId);
    if (members && members.length > 0) {
        return response200(res, msg.groupMemberFetched, members);
    } else {
        return response400(res, msg.noMemberFetched);
    }
});

const fetchFrequentlyContacted = catchAsyncError(async (req, res) => {
    const userId = req.user

    const data = await chatService.frequently_contacted_list(userId);
    return response200(res, msg.fetchSuccessfully, data);
});

const fetchSingleGroupDetails = catchAsyncError(async (req, res) => {
    const userId = req.user
    const { groupId } = req.params

    const data = await chatService.fetch_group_details(groupId, userId,)
    return response200(res, msg.fetchSuccessfully, data);
});

export { updateSocketId, checkGroup, createPrivateGroup, createTeamGroup, resetUnreadCount, fetchMyGroups, fetchGroupMembers, fetchFrequentlyContacted, fetchSingleGroupDetails }

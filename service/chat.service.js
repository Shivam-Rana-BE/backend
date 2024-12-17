import sequelizeDAO from '../DAO/sequelizeDAO.js';
import db from '../db/models/index.js';
import { uploadToAzure } from '../lib/file-upload/index.js';
import { chat_type, modelName, msg, user_type } from '../utils/constant.js';
import { Op, Sequelize } from 'sequelize';
import userService from './user.service.js';

const update_socket_id = async (userId, socketId) => {
    userId = parseInt(userId)
    // make user online
    await userService.update_user({ id: userId }, { socket_id: socketId, is_online: true })

    // fetch pending messages
    const pendingMessages = await sequelizeDAO.getData(modelName.MESSAGE, {
        isDeleted: false,
        delivery_queue: {
            [Op.contains]: [userId]
        }
    })

    // added in delivered and removed from delivery queue
    if (pendingMessages.length > 0) {
        for (const message of pendingMessages) {
            await chatService.mark_as_delivered(userId, message);
            message.delivery_queue = message.delivery_queue.filter((id) => id !== userId);
            await message.save();
        }
    }
}

const find_unread_count = async (match) => {
    try {
        return await sequelizeDAO.getOneData(modelName.GROUP_MEMBER, { ...match, isDeleted: false })
    } catch (error) {
        throw error;
    }
}

const check_group = async (payload) => {
    try {
        const { receiverId, userId } = payload
        const query = {

            [Op.and]: [
                { group_type: chat_type.Direct },
                { isDeleted: false },
                {
                    [Op.or]: [
                        { user_id: userId },
                        { user_id: receiverId }
                    ]
                }
            ]
        }
        const options = {
            attributes: ['group_id'],
            group: ['group_id'],
            having: Sequelize.literal('COUNT(*) > 1')
        }

        let groups = await sequelizeDAO.getData(modelName.GROUP_MEMBER, query, options);
        const groupId = groups.length > 0 ? groups[0].group_id : null;
        return groupId

    } catch (error) {
        throw error;
    }
}

const check_member = async (query) => {
    return sequelizeDAO.getOneData(modelName.GROUP_MEMBER, query)
}

const create_direct_group = async (payload) => {
    try {
        const { receiverId, userId } = payload

        const group = await sequelizeDAO.createData(modelName.GROUP, { group_name: "", last_message: "", type: chat_type.Direct })

        const members = [
            { user_id: userId, unread_counts: 0, group_id: group?.id, group_type: chat_type.Direct },
            { user_id: receiverId, unread_counts: 0, group_id: group?.id, group_type: chat_type.Direct },
        ];

        return await sequelizeDAO.bulkCreateData(modelName.GROUP_MEMBER, members)
    } catch (error) {
        throw error;
    }
}
const create_team_group = async (payload) => {
    try {
        const { members, userId, groupName, file } = payload
        let group_icon
        if (file) {
            const uploadedFile = await uploadToAzure("chat", `group`, file);
            group_icon = uploadedFile.url
        }

        const group = await sequelizeDAO.createData(modelName.GROUP, { group_name: groupName, last_message: "", type: chat_type.Group, group_icon })

        let memberDetails = []
        members.map((val) => {
            memberDetails.push({ user_id: val, unread_counts: 0, group_id: group?.id, group_type: chat_type.Group })
        })

        memberDetails.push({ user_id: userId, unread_counts: 0, group_id: group?.id, group_type: chat_type.Group })

        return await sequelizeDAO.bulkCreateData(modelName.GROUP_MEMBER, memberDetails)
    } catch (error) {
        throw error;
    }
}

const find_group_member = async (groupId) => {
    try {
        return await sequelizeDAO.getData(modelName.GROUP_MEMBER, { group_id: groupId, isDeleted: false })
    } catch (error) {
        throw error;
    }
}

const extractMimeType = async (base64String) => {
    // Match the MIME type before the 'base64,' part
    const match = base64String.match(/^data:(.*?);base64,/);

    if (match && match[1]) {
        return match[1];  // Return MIME type
    } else {
        throw new Error('Invalid Base64 string format');
    }
}

const save_message = async (message_type, message, groupId, files, senderId, tagged_users) => {
    try {

        let fileUrls = [];
        let filePayload = []

        if (files && files?.length) {
            for (let fileData of files) {
                let mimeType = await extractMimeType(fileData.fileData)
                const cleanBase64String = fileData.fileData.replace(/^data:.+;base64,/, '');
                const buffer = Buffer.from(cleanBase64String, 'base64');
                const file = { originalname: fileData.fileName, buffer, mimetype: mimeType };

                const result = await uploadToAzure("chat", "group", file);
                fileUrls.push({ url: result.url, size: fileData.fileSize });
            }
        }
        const storedMessage = await sequelizeDAO.createData(modelName.MESSAGE, { group_id: groupId, user_id: senderId, message_type, message, tagged_users })

        // handle files
        fileUrls?.map((val) => {
            filePayload.push({
                message_id: storedMessage?.id,
                user_id: senderId,
                file_size: val.size,
                file_url: val.url
            })
        })

        await sequelizeDAO.bulkCreateData(modelName.MESSAGE_ATTACHMENT, filePayload)
        return storedMessage
    } catch (error) {
        throw error;
    }
}

const send_message = async (message_type, message, groupId, files, senderId, tagged_users) => {
    try {
        const newMessage = await save_message(message_type, message, groupId, files, senderId, tagged_users)

        // update last message
        await sequelizeDAO.updateData(modelName.GROUP, { id: groupId, isDeleted: false }, { last_message: message, last_message_id: newMessage?.id })
        await sequelizeDAO.updateData(
            modelName.GROUP_MEMBER,
            {
                group_id: groupId,
                user_id: { [Op.ne]: senderId },
                isDeleted: false
            },
            { unread_counts: Sequelize.literal('unread_counts + 1') },
        );
        return newMessage
    } catch (error) {
        throw error;
    }
}

const get_group_messages = async (group_id) => {
    try {
        const options = {
            include: [
                {
                    model: db.User,
                    as: 'sender',
                    attributes: {
                        include: [
                            [
                                Sequelize.literal(`
                                    CASE 
                                        WHEN "sender"."user_type" = 'Parent' THEN (SELECT "profile_image" FROM "Parents" WHERE "Parents"."user_id" = "sender"."id")
                                      --  WHEN "sender"."user_type" = 'Therapist' THEN (SELECT "profile_image" FROM "Therapists" WHERE "Therapists"."user_id" = "sender"."id")
                                      --  WHEN "sender"."user_type" = 'TherapyCenter' THEN (SELECT "profile_image" FROM "TherapistCenters" WHERE "TherapistCenters"."user_id" = "sender"."id")
                                        ELSE NULL
                                    END
                                `),
                                'profile_image',
                            ],
                        ],
                        exclude: ['email', 'password', 'phone_number', 'socket_id', 'isDeleted', 'reset_password_code', 'reset_password_expires', 'createdAt', 'updatedAt'],
                    },
                },
                {
                    model: db.MessageAttachments,
                    as: 'attachments',
                    attributes: ['file_size', 'file_url'],
                },
            ],
            order: [["createdAt", "DESC"]],
            attributes: [
                'id',
                'group_id',
                'message_type',
                'message',
                'delivered',
                'seen',
                'tagged_users',
                'createdAt',
                [
                    Sequelize.literal(`(
                        SELECT json_agg(json_build_object(
                            'id', "Users"."id",
                            'name', "Users"."name",
                            'is_online', "Users"."is_online",
                            'user_type', "Users"."user_type"
                        ))
                        FROM "Users"
                        WHERE "Users"."id"::TEXT = ANY("Messages"."tagged_users")
                    )`),
                    'tagged_users',
                ],
            ]
        }

        return await sequelizeDAO.getDataWithPagination(modelName.MESSAGE, { group_id: group_id, isDeleted: false }, options);

    } catch (error) {
        throw error;
    }
}


const fetch_single_message = async (message_id) => {
    try {
        const options = {
            order: [["createdAt", "DESC"]],
            attributes: [
                'id',
                'group_id',
                'message_type',
                'message',
                'delivered',
                'seen',
                'tagged_users',
                'createdAt',
                [
                    Sequelize.literal(`(
                        SELECT json_agg(json_build_object(
                            'id', "Users"."id",
                            'name', "Users"."name",
                            'is_online', "Users"."is_online",
                            'user_type', "Users"."user_type"
                        ))
                        FROM "Users"
                        WHERE "Users"."id"::TEXT = ANY("Messages"."tagged_users")
                    )`),
                    'tagged_users',
                ],
            ]
        };

        const include = [
            {
                model: db.User,
                as: 'sender',
                attributes: {
                    include: [
                        [
                            Sequelize.literal(`
                                CASE 
                                    WHEN "sender"."user_type" = 'Parent' THEN (SELECT "profile_image" FROM "Parents" WHERE "Parents"."user_id" = "sender"."id")
                                  --  WHEN "sender"."user_type" = 'Therapist' THEN (SELECT "profile_image" FROM "Therapists" WHERE "Therapists"."user_id" = "sender"."id")
                                  --  WHEN "sender"."user_type" = 'TherapyCenter' THEN (SELECT "profile_image" FROM "TherapistCenters" WHERE "TherapistCenters"."user_id" = "sender"."id")
                                    ELSE NULL
                                END
                            `),
                            'profile_image',
                        ],
                    ],
                    exclude: ['email', 'password', 'phone_number', 'socket_id', 'isDeleted', 'reset_password_code', 'reset_password_expires', 'createdAt', 'updatedAt'],
                },
            },
            {
                model: db.MessageAttachments,
                as: 'attachments',
                attributes: ['file_size', 'file_url'],
            },
        ];

        // Fetch message with all required details
        return await sequelizeDAO.getOneWithRelations(modelName.MESSAGE, { id: message_id, isDeleted: false }, include, options);
    } catch (error) {
        throw error;
    }
};

const mark_as_delivered = async (userId, message) => {
    try {
        // let message = await sequelizeDAO.getOneData(modelName.MESSAGE, { id: messageId, isDeleted: false })
        userId = parseInt(userId)
        const currentDelivered = message.delivered || [];
        if (!currentDelivered.includes(userId) && message.user_id !== userId) {
            message.delivered = [...currentDelivered, userId]
            message = await message.save()
        }

        return message;
    } catch (error) {
        console.error(`Error in mark_as_delivered: ${error.message}`);
        throw error;
    }
}

const add_in_pending_queue = async (userId, message) => {
    try {
        const currentPending = message.delivery_queue || [];

        if (!currentPending.includes(userId) && message.user_id !== userId) {
            message.delivery_queue = [...currentPending, userId];
            await message.save();
        }

        return message;
    } catch (error) {
        console.error(`Error in mark_as_delivered: ${error.message}`);
        throw error;
    }
}


const manage_open_chat = async (payload) => {
    try {
        let { userId, lastMessageId, groupId } = payload

        // const data = await db.Messages.findAll()

        let message = await sequelizeDAO.updateData(
            modelName.MESSAGE,
            {

                group_id: groupId,
                id: { [Op.lte]: lastMessageId },
                isDeleted: false,
                [Op.and]: {
                    [Op.or]: [
                        Sequelize.literal(`seen IS NULL`),
                        Sequelize.literal(`NOT (seen @> ARRAY[${parseInt(userId)}]::INTEGER[])`)
                    ]
                }

            },
            {
                seen: Sequelize.literal(`array_append(seen, ${parseInt(userId)})`),
            },
        );

        await reset_unread_counts(userId, groupId)


        return
    } catch (error) {
        console.error('Error in markMessagesAsSeenAndResetUnread:', error.message);
        throw error;
    }
};

// not in use
// const mark_as_seen = async (messageId, userId) => {
//     try {
//         let message = await sequelizeDAO.getOneData(modelName.MESSAGE, { id: messageId, isDeleted: false })

//         const currentSeen = message.seen || [];
//         if (!currentSeen.includes(userId) && message.user_id !== userId) {
//             message.seen = [...currentSeen, userId.toString()]
//             message = await message.save()
//         }

//         return message;
//     } catch (error) {
//         console.error(`Error in mark_as_seen: ${error.message}`);
//         throw error;
//     }
// }

const update_side_bar = async (groupId, userId) => {
    try {
        const include = [
            {
                model: db.GroupMember,
                as: 'groupMembers',
                attributes: ['unread_counts', 'user_id'],
                where: { user_id: userId, group_id: groupId },
                required: false,
                include: [
                    {
                        model: db.User,
                        as: 'user',
                        attributes: ['user_type', 'name', 'is_online'],
                    }
                ],
            },
            {
                model: db.Messages,
                as: 'messages',
                where: Sequelize.where(
                    Sequelize.col('Groups.last_message_id'),
                    Sequelize.Op.eq,
                    Sequelize.col('messages.id')
                ),
                attributes: [
                    [
                        Sequelize.literal(`
                            (
                                SELECT json_agg(json_build_object(
                                    'id', "Users"."id",
                                    'name', "Users"."name",
                                    'is_online', "Users"."is_online",
                                    'user_type', "Users"."user_type"
                                ))
                                FROM "Users"
                                WHERE "Users"."id"::TEXT = ANY("messages"."tagged_users")
                            )
                        `),
                        'tagged_users'
                    ],
                ],
                required: false,
            },
        ]
        const group = await sequelizeDAO.getOneWithRelations(
            modelName.GROUP,
            { id: groupId, isDeleted: false },
            include,
            {
                attributes: [
                    'id',
                    'group_name',
                    'last_message',
                    'last_message_id',
                    'type',
                    'updatedAt',
                    'group_icon',
                    [
                        Sequelize.literal(`
                            CASE 
                                WHEN "groupMembers->user"."user_type" = 'Parent' THEN (SELECT "profile_image" FROM "Parents" WHERE "Parents"."user_id" = "groupMembers->user"."id")
                                WHEN "groupMembers->user"."user_type" = 'Therapist' THEN (SELECT "profile_image" FROM "Therapists" WHERE "Therapists"."user_id" = "groupMembers->user"."id")
                                WHEN "groupMembers->user"."user_type" = 'TherapyCenter' THEN (SELECT "profile_image" FROM "TherapistCenters" WHERE "TherapistCenters"."user_id" = "groupMembers->user"."id")
                                ELSE NULL
                            END
                        `),
                        'profile_image'
                    ]
                ]
            }
        );

        if (!group) {
            throw new Error('Group not found');
        }
        let chatType = group.type
        const userDetails = group.groupMembers[0]
        const messageDetails = group.messages[0]?.tagged_users || []

        return {
            groupId: group.id,
            groupName: chatType === "group" ? group.group_name : userDetails.user?.name,
            groupImage: chatType === "group" ? group.group_icon : userDetails.user?.profile_image || "",
            lastMessage: group.last_message || "",
            updatedAt: group.updatedAt,
            type: chatType,
            unread_counts: userDetails.unread_counts,
            tagged_users: messageDetails
        };
    } catch (error) {
        console.error(`Error fetching sidebar data: ${error.message}`);
        throw error;
    }
};


const get_group_members = async (groupId) => {
    try {
        const group = await sequelizeDAO.getData(modelName.GROUP_MEMBER, { group_id: groupId, isDeleted: false }, { attributes: ['id', 'user_id', 'group_type',] })

        return group.map(member => member?.user_id)
    } catch (error) {
        console.error(`Error fetching sidebar data: ${error.message}`);
        throw error;
    }
};

const get_socket_id = async (userId) => {
    try {
        const user = await sequelizeDAO.getOneData(modelName.USER, { id: userId }, { attributes: ['id', 'socket_id', 'is_online'] })

        return { socket_id: user.socket_id, is_online: user.is_online }
    } catch (error) {
        console.error(`Error fetching sidebar data: ${error.message}`);
        throw error;
    }
};

const transformGroupData = async (userId, data, type) => {
    const transformedData = await Promise.all(
        data.map(async (val) => {
            if (val.type === "direct") {
                const otherUser = val.groupMembers?.find(member => member.user.id !== userId);

                if (otherUser) {
                    val.group_name = otherUser.user.name || val.group_name;
                    val.group_icon = otherUser.user.profile_image || "";
                }
            }

            if (val?.messages && Array.isArray(val.messages) && val.messages.length > 0) {
                val.dataValues.tagged_users = val.messages[0]?.tagged_users || [];
                delete val.dataValues.messages;
            }

            // Find unread counts
            const userDetails = await find_unread_count({ group_id: val?.id, user_id: userId });
            val.dataValues.unread_counts = userDetails ? userDetails.unread_counts : 0;

            return val;
        })
    );

    if (type === "unread") {
        return transformedData.filter(val => val?.dataValues?.unread_counts > 0);
    }
    return transformedData;
};

const fetch_group_details = async (groupId, userId) => {
    try {

        const include = [
            {
                model: db.GroupMember,
                as: 'groupMembers',
                attributes: ['user_id'],
                where: { group_id: groupId },
                required: false,
                include: [
                    {
                        model: db.User,
                        as: 'user',
                        attributes: ['user_type', 'name', 'is_online', 'id'],
                    }
                ],
            },
        ]
        const data = await sequelizeDAO.getData(modelName.GROUP, { id: groupId, isDeleted: false }, { include })
        return await transformGroupData(userId, data);
    } catch (error) {
        throw error;
    }
}
const getPaginatedResponse = async (limit, page, data, totalCount) => {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const offsetData = (pageNumber - 1) * limitNumber;
    const paginatedData = data?.slice(offsetData, offsetData + limitNumber);

    const totalPages = Math.ceil(totalCount / limitNumber);

    return {
        data: paginatedData,
        totalCount,
        totalPages,
        currentPage: pageNumber,
    };
};

const fetch_sidebar_data = async (payload) => {
    try {
        const { userId, page, limit, type, search } = payload;
        // Base query
        const query = { id: { [Op.in]: await fetch_my_groupIds(userId) } };
        if (type === "direct" || type === "group") {
            query.type = type;
        }
        if (search) {
            query[Op.or] = [
                {
                    [Op.and]: [
                        { type: "group" },
                        { group_name: { [Op.iLike]: `%${search}%` } },
                    ],
                },
                {
                    [Op.and]: [
                        { type: "direct" },
                        { '$groupMembers.user.name$': { [Op.iLike]: `%${search}%` } },
                        { "$groupMembers.user.id$": { [Op.ne]: userId } }
                    ],
                },
            ];
        }

        const include = [
            {
                model: db.GroupMember,
                as: "groupMembers",
                required: true,
                where: {},
                attributes: ["unread_counts", "user_id"],
                include: [
                    {
                        model: db.User,
                        as: "user",
                        required: true,
                        attributes: [
                            "id",
                            "name",
                            "user_type",
                            "is_online",
                            [
                                Sequelize.literal(`
                                        CASE 
                                            WHEN "groupMembers->user"."user_type" = 'Parent' THEN (SELECT "profile_image" FROM "Parents" WHERE "Parents"."user_id" = "groupMembers->user"."id")
                                            WHEN "groupMembers->user"."user_type" = 'Therapist' THEN (SELECT "profile_image" FROM "Therapists" WHERE "Therapists"."user_id" = "groupMembers->user"."id")
                                            WHEN "groupMembers->user"."user_type" = 'TherapyCenter' THEN (SELECT "profile_image" FROM "TherapistCenters" WHERE "TherapistCenters"."user_id" = "groupMembers->user"."id")
                                            ELSE NULL
                                        END
                                    `),
                                "profile_image",
                            ],
                        ],
                    },
                ],
            },
        ]

        // if (type === "unread") {
        //     include[0].where = {
        //         unread_counts: { [Op.gt]: 0 },
        //         user_id: userId,
        //     };
        // }
        let groupData = await db.Groups.findAll({
            attributes: ["id", "group_name", "last_message", "updatedAt", "type", "group_icon", "last_message_id"],
            order: [
                ['createdAt', 'DESC']
            ],
            where: query,
            include,
            distinct: true,
        });

        // console.log('✌️groupData --->', groupData);
        const transformedGroups = await transformGroupData(userId, groupData, type);
        return await getPaginatedResponse(limit, page, transformedGroups, transformedGroups.length)
    } catch (error) {
        console.error("Error fetching sidebar data:", error);
        throw error;
    }
};
const fetch_my_groupIds = async (id) => {
    const data = await sequelizeDAO.getData(modelName.GROUP_MEMBER, { user_id: id, isDeleted: false }, { attributes: ['group_id'] })
    return data.map((val) => val.group_id)
};

const frequently_contacted_list = async (userId) => {
    const groupIds = await fetch_my_groupIds(userId)

    if (!groupIds.length) {
        return [];
    }

    const frequentlyContacted = await db[modelName.GROUP].findAll({
        where: {
            id: { [Op.in]: groupIds },
            isDeleted: false
        },
        attributes: {
            include: [
                [
                    Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM "${modelName.MESSAGE}" AS "messages"
                        WHERE "messages"."group_id" = "${modelName.GROUP}"."id" AND "messages"."isDeleted" = false
                    )`),
                    'messageCount'
                ],
                'last_message'
            ]
        },
        order: [[Sequelize.literal('"messageCount"'), 'DESC']],
        limit: 3,
        include: [
            {
                model: db.GroupMember,
                as: "groupMembers",
                required: false,
                where: {},
                attributes: ["unread_counts", "user_id"],
                include: [
                    {
                        model: db.User,
                        as: "user",
                        required: false,
                        attributes: [
                            "id",
                            "name",
                            "user_type",
                            "is_online",
                            [
                                Sequelize.literal(`
                                    CASE 
                                    WHEN "groupMembers->user"."user_type" = 'Parent' THEN (SELECT "profile_image" FROM "Parents" WHERE "Parents"."user_id" = "groupMembers->user"."id")
                                    WHEN "groupMembers->user"."user_type" = 'Therapist' THEN (SELECT "profile_image" FROM "Therapists" WHERE "Therapists"."user_id" = "groupMembers->user"."id")
                                            WHEN "groupMembers->user"."user_type" = 'TherapyCenter' THEN (SELECT "profile_image" FROM "TherapistCenters" WHERE "TherapistCenters"."user_id" = "groupMembers->user"."id")
                                            ELSE NULL
                                        END
                                    `),
                                "profile_image",
                            ],
                        ],
                    },
                ],
            },
            {
                model: db.Messages,
                as: 'messages',
                where: Sequelize.where(
                    Sequelize.col('Groups.last_message_id'),
                    Sequelize.Op.eq,
                    Sequelize.col('messages.id')
                ),
                attributes: [
                    [
                        Sequelize.literal(`
                            (
                                SELECT json_agg(json_build_object(
                                    'id', "Users"."id",
                                    'name', "Users"."name",
                                    'is_online', "Users"."is_online",
                                    'user_type', "Users"."user_type"
                                ))
                                FROM "Users"
                                WHERE "Users"."id"::TEXT = ANY("messages"."tagged_users")
                                )
                        `),
                        'tagged_users'
                    ],
                ],
                required: false,
            },
        ]
    });
    const transformedGroups = await transformGroupData(userId, frequentlyContacted);

    return transformedGroups;
};

const getGroupMembers = async (groupId, search, userId) => {
    const searchCondition = search ? {
        name: { [Op.iLike]: `%${search}%` }
    } : {};

    const members = await sequelizeDAO.getData(modelName.GROUP_MEMBER, { group_id: groupId, isDeleted: false, user_id: { [Op.ne]: userId } }, {
        attributes: ['user_id', 'group_type', 'id'],
        include: [
            {
                model: db.User,
                as: 'user',
                attributes: ['id', 'name', 'user_type'],
                where: searchCondition,
            }
        ]
    });
    return members;
};


const fetch_all_messages = async (payload) => {
    try {

        const { groupId, lastMessageId, page = 1, limit = 10 } = payload

        let query = { group_id: groupId, isDeleted: false };

        // If lastMessageId is provided, fetch older messages
        // if (lastMessageId) {
        //     const lastMessage = await sequelizeDAO.getOneData(modelName.MESSAGE, { id: lastMessageId }, { attributes: ['createdAt'] })
        //     console.log('lastMessage: ', lastMessage);

        //     if (lastMessage) {
        //         query.createdAt = { [Sequelize.Op.lt]: lastMessage.createdAt };
        //     }
        // }
        let option = {
            page: page || 1,
            limit: limit || 10,
            order: [["createdAt", 'DESC']],
            include: [
                {
                    model: db.MessageAttachments,
                    as: 'attachments',
                    attributes: ['file_size', 'file_url'],
                },
                {
                    model: db.User,
                    as: 'sender',
                    attributes: ['user_type', 'name', 'id',
                        [
                            Sequelize.literal(`
                                CASE 
                                    WHEN "sender"."user_type" = 'Parent' THEN 
                                        (SELECT "profile_image" FROM "Parents" WHERE "Parents"."user_id" = "sender"."id")
                                    -- WHEN "sender"."user_type" = 'Therapist' THEN (SELECT "profile_image" FROM "Therapists" WHERE "Therapists"."user_id" = "sender"."id")
                                    -- WHEN "sender"."user_type" = 'TherapyCenter' THEN (SELECT "profile_image" FROM "TherapistCenters" WHERE "TherapistCenters"."user_id" = "sender"."id")
                                    ELSE NULL
                                END
                            `),
                            'profile_image'
                        ]
                    ],
                }
            ],
            attributes: [
                'id',
                'message_type',
                'message',
                'group_id',
                'createdAt',
                'delivered',
                'seen',
                [
                    Sequelize.literal(`(
                        SELECT json_agg(json_build_object(
                            'id', "Users"."id",
                            'name', "Users"."name",
                            'is_online', "Users"."is_online",
                            'user_type', "Users"."user_type"
                        ))
                        FROM "Users"
                        WHERE "Users"."id"::TEXT = ANY("Messages"."tagged_users")
                    )`),
                    'tagged_users',
                ],],
        }

        let result = await sequelizeDAO.getDataWithPagination(modelName.MESSAGE, query, option);
        result.data = result?.data?.reverse();

        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const reset_unread_counts = async (userId, groupId) => {
    return await sequelizeDAO.updateData(modelName.GROUP_MEMBER, { group_id: groupId, user_id: userId }, { unread_counts: 0 })
}

const set_offline = async (socketId) => {
    return await sequelizeDAO.updateData(modelName.USER, { socket_id: socketId }, { is_online: false })
}

const get_group_members_bulk = async (groupIds, senderId) => {
    try {
        const groupMembers = await db.GroupMember.findAll({
            where: {
                group_id: groupIds,
                user_id: {
                    [Sequelize.Op.ne]: senderId,
                },
                isDeleted: false,
            },
            attributes: ['group_id', 'user_id'],
        });

        return groupMembers;
    } catch (error) {
        console.error('Error fetching group members in bulk:', error);
        throw error;
    }
};


const chatService = {
    update_socket_id,
    check_group,
    check_member,
    create_direct_group,
    find_group_member,
    create_team_group,
    send_message,
    get_group_messages,
    fetch_single_message,
    mark_as_delivered,
    // mark_as_seen,
    update_side_bar,
    get_group_members,
    get_socket_id,
    fetch_sidebar_data,
    frequently_contacted_list,
    getGroupMembers,
    reset_unread_counts,
    fetch_all_messages,
    set_offline,
    fetch_group_details,
    add_in_pending_queue,
    manage_open_chat,
    get_group_members_bulk,
    find_unread_count
}

export default chatService;
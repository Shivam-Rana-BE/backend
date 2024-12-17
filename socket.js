import { chatService } from "./service/index.js";

export const socketConfig = async (io, socket) => {

    const userId = parseInt(socket.handshake.query.userId);

    if (!userId) {
        socket.emit('error', { message: 'UserId is required for the connection.' });
        return socket.disconnect();
    } else {
        // here we are updating socket id, make user online and removed offline messages from queue and added them in delivered
        await chatService.update_socket_id(userId, socket.id)
    }

    socket.on('JOIN ROOM', async (data) => {
        const { groupId, lastMessageId } = JSON.parse(data);
        socket.join(groupId);
        if (lastMessageId) {
            const result = await chatService.manage_open_chat({ groupId, lastMessageId, userId });
            const user = await chatService.get_socket_id(userId);
            if (user?.socket_id && user?.is_online) {
                io.to(user?.socket_id).emit('RECEIVER', {
                    payload: result,
                    type: 'OPEN CHAT',
                });
            }
        }
    });

    socket.on('LEAVE ROOM', (data) => {
        const { groupId } = JSON.parse(data);
        socket.leave(groupId);
    });

    socket.on('SEND MESSAGE', async (data) => {
        const payload = JSON.parse(data);
        const { message_type, message, groupId, files, senderId, tagged_users } = payload;
        const newMessage = await chatService.send_message(message_type, message, groupId, files, senderId, tagged_users)

        const lastMessage = await chatService.fetch_single_message(newMessage?.id)
        io.in(groupId).emit('RECEIVER', {
            payload: lastMessage,
            type: 'NEW MESSAGE',
        });

        // update receiver sidebar
        const groupMembers = await chatService.get_group_members(groupId);

        for (const member of groupMembers) {

            if (member !== senderId) {
                const sidebarData = await chatService.update_side_bar(groupId, member);
                const user = await chatService.get_socket_id(member);

                if (user?.socket_id && user?.is_online) {
                    await chatService.mark_as_delivered(member, newMessage)
                    await
                        io.to(user?.socket_id).emit('RECEIVER', {
                            payload: sidebarData,
                            type: 'UPDATE SIDEBAR',
                        });
                } else {
                    await chatService.add_in_pending_queue(member, newMessage)
                }
            }
        }
    });

    socket.on('OPEN CHAT', async (data) => {
        const payload = JSON.parse(data);
        const result = await chatService.manage_open_chat({ ...payload, userId });

        const user = await chatService.get_socket_id(userId);
        if (user?.socket_id && user?.is_online) {
            io.to(user?.socket_id).emit('RECEIVER', {
                payload: result,
                type: 'OPEN CHAT',
            });
        }
    });

    // not in use
    // socket.on('DELIVERED', async (data) => {
    //     const { messageId, userId } = JSON.parse(data);
    //     const updatedMessage = await chatService.mark_as_delivered(messageId, userId);

    //     io.in(updatedMessage.group_id).emit('RECEIVER', {
    //         payload: updatedMessage,
    //         type: 'DELIVERY STATUS UPDATED',
    //     });
    // });

    // not in use
    // socket.on('SEEN', async (data) => {
    //     const { messageId, userId } = JSON.parse(data);
    //     const updatedMessage = await chatService.mark_as_seen(messageId, userId);

    //     io.in(updatedMessage.group_id).emit('RECEIVER', {
    //         payload: updatedMessage,
    //         type: 'SEEN STATUS UPDATED',
    //     });
    // });

    socket.on('SIDEBAR', async (data) => {
        const payload = JSON.parse(data);
        const { userId } = payload;

        const receiverSocket = await chatService.get_socket_id(userId);
        if (receiverSocket?.socket_id && receiverSocket?.is_online) {
            const list = await chatService.fetch_sidebar_data(payload)
            io.to(receiverSocket?.socket_id).emit('RECEIVER', {
                type: 'SIDEBAR',
                payload: list,
            });
        }
    });

    socket.on('FREQUENTLY CONTACTED', async (data) => {
        const payload = JSON.parse(data);
        const { userId } = payload;
        const receiverSocket = await chatService.get_socket_id(userId);

        if (receiverSocket?.socket_id && receiverSocket?.is_online) {
            const frequentlyContacted = await chatService.frequently_contacted_list(userId);
            io.to(receiverSocket?.socket_id).emit('RECEIVER', {
                type: 'FREQUENTLY CONTACTED',
                payload: frequentlyContacted,
            });
        }

    });

    socket.on('CHAT MESSAGE', async (data) => {
        const payload = JSON.parse(data);
        const { userId } = payload;

        const receiverSocket = await chatService.get_socket_id(userId);
        if (receiverSocket?.socket_id && receiverSocket?.is_online) {
            const list = await chatService.fetch_all_messages(payload)
            io.to(receiverSocket?.socket_id).emit('RECEIVER', {
                type: 'CHAT MESSAGE',
                payload: list,
            });
        }
    });


    // older logic
    // socket.on('BROADCAST', async (data) => {
    //     const payload = JSON.parse(data);
    //     const { groupIds, message_type, message, files, senderId } = payload;

    //     const broadcastMessages = [];
    //     for (const groupId of groupIds) {
    //         const newMessage = await chatService.send_message(message_type, message, groupId, files, senderId);
    //         const lastMessage = await chatService.fetch_single_message(newMessage?.id);

    //         io.in(groupId).emit('RECEIVER', {
    //             payload: lastMessage,
    //             type: 'RECEIVE MESSAGE',
    //         });
    //         broadcastMessages.push({ groupId, lastMessage });
    //     }

    //     for (const { groupId, lastMessage } of broadcastMessages) {
    //         const groupMembers = await chatService.get_group_members(groupId);

    //         for (const member of groupMembers) {
    //             if (member !== senderId) {
    //                 const sidebarData = await chatService.update_side_bar(groupId, member);
    //                 const receiverSocket = await chatService.get_socket_id(member);
    //                 if (receiverSocket?.socket_id && receiverSocket?.is_online) {
    //                     await chatService.mark_as_delivered(member, lastMessage)
    //                     io.to(receiverSocket?.socket_id).emit('RECEIVER', {
    //                         payload: sidebarData,
    //                         type: 'UPDATE SIDEBAR',
    //                     });
    //                 } else {
    //                     await chatService.add_in_pending_queue(member, lastMessage)
    //                 }
    //             }
    //         }
    //     }
    // });

    socket.on('BROADCAST', async (data) => {
        const payload = JSON.parse(data);
        const { groupIds, message_type, message, files, senderId } = payload;

        const groupMembers = await chatService.get_group_members_bulk(groupIds, senderId);

        // Set to keep track of processed one-to-one group IDs to avoid duplicates
        const finalGroupIdSet = new Set();
        const broadcastMessages = [];

        await Promise.all(groupMembers.map(async (val) => {
            // Check if a one-to-one group exists between the sender and this group member
            const oneToOneGroupId = await chatService.check_group({ receiverId: val.user_id, userId: senderId });

            // If a valid one-to-one group is found and hasn't already been processed
            if (oneToOneGroupId && !finalGroupIdSet.has(oneToOneGroupId)) {
                finalGroupIdSet.add(oneToOneGroupId);

                // Send the broadcast message to the one-to-one group
                const newMessage = await chatService.send_message(message_type, message, oneToOneGroupId, files, senderId);
                const lastMessage = await chatService.fetch_single_message(newMessage.id);

                broadcastMessages.push({ groupId: oneToOneGroupId, lastMessage });

                // Emit the message to the one-to-one chat room for all connected users
                io.in(oneToOneGroupId).emit('RECEIVER', { payload: lastMessage, type: 'RECEIVE MESSAGE' });
            }
        }));

        // Handle updates for sidebar and delivery queues for all broadcast messages
        for (const { groupId, lastMessage } of broadcastMessages) {
            const groupMembers = await chatService.get_group_members(groupId);

            await Promise.all(groupMembers.map(async (member) => {
                if (member !== senderId) {
                    // Update the sidebar data for the current group and member
                    const sidebarData = await chatService.update_side_bar(groupId, member);
                    const receiverSocket = await chatService.get_socket_id(member);

                    if (receiverSocket?.socket_id && receiverSocket?.is_online) {
                        // Mark the message as delivered for the online user
                        await chatService.mark_as_delivered(member, lastMessage);
                        io.to(receiverSocket?.socket_id).emit('RECEIVER', { payload: sidebarData, type: 'UPDATE SIDEBAR' });
                    } else {
                        // Add the message to the pending delivery queue for offline users
                        await chatService.add_in_pending_queue(member, lastMessage);
                    }
                }
            }));
        }
    });


    socket.on('disconnect', async () => {
        console.log('User disconnected:', socket.id);
        await chatService.set_offline(socket.id)
    });
};

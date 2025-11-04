"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSocketService = void 0;
const gateway_1 = require("../gateway/gateway");
const auth_repo_1 = require("../authModule/auth.repo");
const chat_repo_1 = require("./chat.repo");
const Error_1 = require("../../utils/Error");
class ChatSocketService {
    userModel = new auth_repo_1.UserRepo();
    chatModel = new chat_repo_1.ChatRepo();
    constructor() { }
    sendMessage = async (socket, data) => {
        try {
            const createdBy = socket.user?._id;
            const to = await this.userModel.findById({
                id: data.sendTo
            });
            const chat = await this.chatModel.findOne({
                filter: {
                    participants: {
                        $all: [to?._id, createdBy]
                    },
                    group: {
                        $exists: false
                    }
                }
            });
            if (!chat) {
                throw new Error_1.NotFoundException('chat not found');
            }
            await chat.updateOne({
                $push: {
                    messages: { content: data.content, createdBy: createdBy }
                }
            });
            socket.emit('successMessage', data.content);
            socket.to(gateway_1.connectedSockets.get(to?._id.toString()) || []).emit('newMessage', {
                content: data.content,
                from: socket.user
            });
        }
        catch (error) {
            socket.emit('customError', error);
        }
    };
    joinRoom = async (socket, roomId) => {
        try {
            const group = await this.chatModel.findOne({
                filter: {
                    roomId,
                    participants: {
                        $in: [socket.user?._id]
                    },
                    group: {
                        $exists: true
                    }
                }
            });
            if (!group) {
                throw new Error_1.NotFoundException('group not found');
            }
            socket.join(group.roomId);
        }
        catch (error) {
            socket.emit('customError', error);
        }
    };
    sendGroupMessage = async (socket, data) => {
        try {
            const createdBy = socket.user?._id;
            const group = await this.chatModel.findOne({
                filter: {
                    _id: data.groupId,
                    participants: {
                        $in: [socket.user?._id]
                    },
                    group: {
                        $exists: true
                    }
                }
            });
            if (!group) {
                throw new Error_1.NotFoundException('group not found');
            }
            await group.updateOne({
                $push: {
                    messages: { content: data.content, createdBy: createdBy }
                }
            });
            socket.emit('successMessage', data.content);
            socket.to(group.roomId).emit('newMessage', {
                content: data.content,
                from: socket.user,
                groupId: group._id
            });
        }
        catch (error) {
            socket.emit('customError', error);
        }
    };
}
exports.ChatSocketService = ChatSocketService;

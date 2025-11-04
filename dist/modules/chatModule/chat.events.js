"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatEvent = void 0;
const chat_socket_service_1 = require("./chat.socket.service");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const chat_validation_1 = require("./chat.validation");
class ChatEvent {
    chatSocketService = new chat_socket_service_1.ChatSocketService();
    constructor() { }
    sendMessage = async (socket) => {
        socket.on('sendMessage', (data) => {
            (0, validation_middleware_1.socketValidation)(chat_validation_1.sendMessageSchema, this.chatSocketService.sendMessage.bind(this.chatSocketService))(socket, data);
        });
    };
    joinRoom = async (socket) => {
        socket.on('join_room', ({ roomId }) => {
            return this.chatSocketService.joinRoom(socket, roomId);
        });
    };
    sendGroupMessage = async (socket) => {
        socket.on('sendGroupMessage', ({ content, groupId }) => {
            (0, validation_middleware_1.socketValidation)(chat_validation_1.sendGroupMessageSchema, this.chatSocketService.sendGroupMessage.bind(this.chatSocketService))(socket, { content, groupId });
        });
    };
}
exports.ChatEvent = ChatEvent;

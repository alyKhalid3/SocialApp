"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageModel = exports.chatModel = void 0;
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'user', required: true },
    content: { type: String, required: true },
}, {
    timestamps: true
});
const chatSchema = new mongoose_1.Schema({
    participants: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'user', required: true }],
    messages: [messageSchema],
    group: { type: String },
    groupName: { type: String },
    roomId: { type: String },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'user', required: true },
}, {
    timestamps: true
});
exports.chatModel = mongoose_1.models.chat || (0, mongoose_1.model)('chat', chatSchema);
exports.messageModel = (0, mongoose_1.model)('message', messageSchema);

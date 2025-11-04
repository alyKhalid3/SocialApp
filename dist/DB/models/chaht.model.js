"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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

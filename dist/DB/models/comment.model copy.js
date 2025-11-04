"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const commentSchema = new mongoose_1.default.Schema({
    content: { type: String },
    attachments: [{ type: String }],
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    postId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'post' },
    commentId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'user' },
    likes: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'user'
        }],
    tags: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'user'
        }],
    freezedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'user' },
    freezedAt: { type: Date },
    restoredBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'user' },
    restoredAt: { type: Date },
}, {
    timestamps: true
});
exports.commentModel = mongoose_1.default.model('comment', commentSchema);

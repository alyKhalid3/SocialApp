"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const post_types_1 = require("../../modules/postModule/post.types");
const postSchema = new mongoose_1.default.Schema({
    content: { type: String },
    attachments: [{ type: String }],
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    availability: {
        type: String,
        enum: [post_types_1.postAvailabilityEnum.PUBLIC, post_types_1.postAvailabilityEnum.PRIVATE, post_types_1.postAvailabilityEnum.FRIENDS],
        default: post_types_1.postAvailabilityEnum.PUBLIC
    },
    likes: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'user'
        }],
    tags: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'user'
        }],
    allowComments: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    assetsFolderId: { type: String }
}, {
    timestamps: true
});
exports.postModel = mongoose_1.default.model('post', postSchema);

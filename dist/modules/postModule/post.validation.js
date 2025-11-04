"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.likeUnlikePostSchema = exports.updatePostSchema = exports.createPostSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const generalValidation_1 = require("../../utils/generalValidation");
exports.createPostSchema = zod_1.default.object({
    content: generalValidation_1.generalValidation.content,
    files: generalValidation_1.generalValidation.files({}),
    availability: generalValidation_1.generalValidation.availability,
    tags: generalValidation_1.generalValidation.tags,
    allowComments: generalValidation_1.generalValidation.allowComments
}).superRefine((data, ctx) => {
    if (!data.content && (!data.files || data.files.length === 0))
        return ctx.addIssue({
            code: 'custom',
            message: 'content or attachment is required',
            path: ['content', 'attachment']
        });
    if (data.tags?.length && data.tags.length != [...new Set(data.tags)].length) {
        return ctx.addIssue({
            code: 'custom',
            message: 'tags must be unique',
            path: ['tags']
        });
    }
});
exports.updatePostSchema = zod_1.default.object({
    content: generalValidation_1.generalValidation.content,
    availability: generalValidation_1.generalValidation.availability,
    removedAttachments: zod_1.default.array(zod_1.default.string()).optional(),
    newTags: generalValidation_1.generalValidation.tags,
    removedTags: generalValidation_1.generalValidation.tags,
    allowComments: generalValidation_1.generalValidation.allowComments
});
exports.likeUnlikePostSchema = zod_1.default.object({
    postId: zod_1.default.string(),
    likeType: zod_1.default.enum(['like', 'unlike'])
});

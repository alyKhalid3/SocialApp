"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCommentSchema = exports.createReplySchema = exports.createCommentSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const generalValidation_1 = require("../../utils/generalValidation");
exports.createCommentSchema = zod_1.default.object({
    content: generalValidation_1.generalValidation.content,
    id: zod_1.default.string(),
    files: generalValidation_1.generalValidation.files({ fieldname: 'attachments' }),
    tags: generalValidation_1.generalValidation.tags
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
exports.createReplySchema = exports.createCommentSchema.safeExtend({
    commentId: zod_1.default.string()
});
exports.updateCommentSchema = zod_1.default.object({
    content: generalValidation_1.generalValidation.content,
    removedAttachments: zod_1.default.array(zod_1.default.string()).optional(),
    newTags: generalValidation_1.generalValidation.tags,
    removedTags: generalValidation_1.generalValidation.tags,
});

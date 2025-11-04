"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalValidation = void 0;
const multer_1 = require("./multer/multer");
const zod_1 = __importDefault(require("zod"));
const post_types_1 = require("../modules/postModule/post.types");
exports.generalValidation = {
    content: zod_1.default.string().optional(),
    files: ({ type = multer_1.fileTypes.images, fieldname = 'attachments' }) => {
        return zod_1.default.array(zod_1.default.object({
            fieldname: zod_1.default.enum([fieldname]),
            originalname: zod_1.default.string(),
            encoding: zod_1.default.string(),
            mimetype: zod_1.default.enum(type),
            size: zod_1.default.number(),
            buffer: zod_1.default.any().optional(),
            path: zod_1.default.string().optional()
        })).optional();
    },
    availability: zod_1.default.enum([
        post_types_1.postAvailabilityEnum.PUBLIC,
        post_types_1.postAvailabilityEnum.PRIVATE,
        post_types_1.postAvailabilityEnum.FRIENDS
    ]).default(post_types_1.postAvailabilityEnum.PUBLIC),
    tags: zod_1.default.array(zod_1.default.string()).optional(),
    allowComments: zod_1.default.boolean().default(true),
};

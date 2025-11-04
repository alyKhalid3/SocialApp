"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const comment_service_1 = require("./comment.service");
const multer_1 = require("../../utils/multer/multer");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const validator = __importStar(require("./comment.validation"));
const router = (0, express_1.Router)({
    mergeParams: true
});
exports.commentRoutes = {
    base: "/comment",
    createComment: "/",
    updateComment: "/update/:id",
    createReply: "/:commentId/reply",
    softDelete: "/soft-delete/:id",
    hardDelete: "/hard-delete/:id"
};
const commentServices = new comment_service_1.CommentServices();
router.post(exports.commentRoutes.createComment, (0, auth_middleware_1.auth)(), (0, multer_1.uploadFile)({}).array('attachments', 4), (0, validation_middleware_1.validation)(validator.createCommentSchema), commentServices.createComment);
router.post(exports.commentRoutes.createReply, (0, auth_middleware_1.auth)(), (0, multer_1.uploadFile)({}).array('attachments', 4), (0, validation_middleware_1.validation)(validator.createReplySchema), commentServices.createReply);
router.patch(exports.commentRoutes.updateComment, (0, auth_middleware_1.auth)(), (0, multer_1.uploadFile)({}).array('newAttachments', 4), (0, validation_middleware_1.validation)(validator.updateCommentSchema), commentServices.updateComment);
router.get('/:commentId', commentServices.getComment);
router.get('/comment-reply/:commentId', commentServices.getCommentWithReply);
router.patch(exports.commentRoutes.softDelete, (0, auth_middleware_1.auth)(), commentServices.softDelete);
router.delete(exports.commentRoutes.hardDelete, (0, auth_middleware_1.auth)(), commentServices.hardDelete);
exports.default = router;

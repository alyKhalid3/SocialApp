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
exports.postRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const post_service_1 = require("./post.service");
const multer_1 = require("../../utils/multer/multer");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const PostValidation = __importStar(require("./post.validation"));
const commentModule_1 = require("../commentModule");
const router = (0, express_1.Router)();
router.use('/:id/comment', commentModule_1.commentRouter);
const postServices = new post_service_1.PostServices();
exports.postRoutes = {
    base: '/post',
    createPost: '/',
    likePost: '/like-unlike',
    updatePost: '/update-post/:id',
    getPost: '/:id',
    softDelete: '/soft-delete/:id',
    hardDelete: '/hard-delete/:id'
};
router.post(exports.postRoutes.createPost, (0, auth_middleware_1.auth)(), (0, multer_1.uploadFile)({}).array('attachments', 4), (0, validation_middleware_1.validation)(PostValidation.createPostSchema), postServices.createPost);
router.patch(exports.postRoutes.likePost, (0, auth_middleware_1.auth)(), (0, validation_middleware_1.validation)(PostValidation.likeUnlikePostSchema), postServices.like_unlikePost);
router.patch(exports.postRoutes.updatePost, (0, auth_middleware_1.auth)(), (0, multer_1.uploadFile)({}).array('newAttachments', 4), (0, validation_middleware_1.validation)(PostValidation.updatePostSchema), postServices.updatePost);
router.get(exports.postRoutes.getPost, (0, auth_middleware_1.auth)(), postServices.getPostById);
router.patch(exports.postRoutes.softDelete, (0, auth_middleware_1.auth)(), postServices.softDelete);
router.delete(exports.postRoutes.hardDelete, (0, auth_middleware_1.auth)(), postServices.hardDelete);
exports.default = router;

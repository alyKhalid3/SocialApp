"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const multer_1 = require("../../utils/multer/multer");
const user_service_1 = require("./user.service");
const chatModule_1 = require("../chatModule");
const router = (0, express_1.Router)();
const userServices = new user_service_1.UserServices();
router.use("/:userId/chat", chatModule_1.chatRouter);
exports.userRoutes = {
    base: '/user',
    profileImage: '/profile-image',
    coverImages: '/cover-images',
    deleteSingleFile: '/delete-file',
    sendFriendRequest: '/send-friend-request',
    acceptFriendReq: '/accept-friend-request/:id',
    deleteFriendReq: '/delete-friend-request/:id',
    unfriend: '/unfriend/:id',
    block: '/block/:id',
    unblock: '/unblock/:id',
    profile: '/profile'
};
router.post(exports.userRoutes.profileImage, (0, auth_middleware_1.auth)(), (0, multer_1.uploadFile)({}).single('image'), userServices.profileImage);
router.post(exports.userRoutes.coverImages, (0, auth_middleware_1.auth)(), (0, multer_1.uploadFile)({}).array('images'), userServices.coverImages);
router.delete(exports.userRoutes.deleteSingleFile, (0, auth_middleware_1.auth)(), userServices.deleteSingleFile);
router.post(exports.userRoutes.sendFriendRequest, (0, auth_middleware_1.auth)(), userServices.sendFriendRequest);
router.patch(exports.userRoutes.acceptFriendReq, (0, auth_middleware_1.auth)(), userServices.acceptFriendReq);
router.patch(exports.userRoutes.deleteFriendReq, (0, auth_middleware_1.auth)(), userServices.deleteFriendReq);
router.patch(exports.userRoutes.unfriend, (0, auth_middleware_1.auth)(), userServices.unfriend);
router.patch(exports.userRoutes.block, (0, auth_middleware_1.auth)(), userServices.blockUser);
router.patch(exports.userRoutes.unblock, (0, auth_middleware_1.auth)(), userServices.unblockUser);
router.get(exports.userRoutes.profile, (0, auth_middleware_1.auth)(), userServices.profile);
exports.default = router;

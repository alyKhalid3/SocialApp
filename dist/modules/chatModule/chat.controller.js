"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRoutes = void 0;
const express_1 = require("express");
const chat_rest_service_1 = require("./chat.rest.service");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)({
    mergeParams: true
});
exports.chatRoutes = {
    base: '/chat',
    getChat: "/",
    createGroupChat: "/create-group",
    getGroupChat: "/get-group-chat/:groupId"
};
const chatServices = new chat_rest_service_1.ChatServices();
router.get(exports.chatRoutes.getChat, (0, auth_middleware_1.auth)(), chatServices.getChat);
router.post(exports.chatRoutes.createGroupChat, (0, auth_middleware_1.auth)(), chatServices.createGroupChat);
router.get(exports.chatRoutes.getGroupChat, (0, auth_middleware_1.auth)(), chatServices.getGroupChat);
exports.default = router;

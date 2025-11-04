"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatServices = void 0;
const auth_repo_1 = require("../authModule/auth.repo");
const Error_1 = require("../../utils/Error");
const chat_repo_1 = require("./chat.repo");
const successHandler_1 = require("../../utils/successHandler");
const mongoose_1 = require("mongoose");
const nanoid_1 = require("nanoid");
class ChatServices {
    userModel = new auth_repo_1.UserRepo();
    chatModel = new chat_repo_1.ChatRepo();
    constructor() { }
    getChat = async (req, res) => {
        const loggedUser = res.locals.user;
        const userId = mongoose_1.Types.ObjectId.createFromHexString(req.params.userId);
        console.log({
            userId: userId,
            loggedUser: loggedUser._id
        });
        const to = await this.userModel.findOne({
            filter: {
                _id: userId,
            }
        });
        if (!to) {
            throw new Error_1.NotFoundException('user not found');
        }
        const chat = await this.chatModel.findOne({
            filter: {
                participants: {
                    $all: [to._id, loggedUser._id]
                },
                group: {
                    $exists: false
                }
            },
            options: {
                populate: 'participants'
            }
        });
        if (!chat) {
            const newChat = await this.chatModel.create({
                data: {
                    participants: [to._id, loggedUser._id],
                    createdBy: loggedUser._id,
                    messages: []
                }
            });
            return (0, successHandler_1.successHandler)({ res, data: newChat });
        }
        return (0, successHandler_1.successHandler)({ res, data: chat });
    };
    createGroupChat = async (req, res) => {
        const user = res.locals.user;
        const { group, participants } = req.body;
        const mutualParticipants = await this.userModel.find({
            filter: {
                _id: { $in: participants }
            }
        });
        if (mutualParticipants.length !== participants.length) {
            throw new Error_1.NotFoundException('some participants not found');
        }
        const roomId = (0, nanoid_1.nanoid)(15);
        const newGroup = await this.chatModel.create({
            data: {
                participants: [...mutualParticipants.map((participant) => participant._id), user._id],
                group,
                createdBy: user._id,
                roomId
            }
        });
        if (!newGroup) {
            throw new Error_1.BadRequestException('group not created');
        }
        return (0, successHandler_1.successHandler)({ res, data: newGroup });
    };
    getGroupChat = async (req, res) => {
        const user = res.locals.user;
        const { groupId } = req.params;
        const chat = await this.chatModel.findOne({
            filter: {
                group: { $exists: true },
                _id: groupId,
                participants: { $in: [user._id] }
            },
            options: {
                populate: "messages.createdBy"
            }
        });
        if (!chat) {
            throw new Error_1.NotFoundException('group not found');
        }
        return (0, successHandler_1.successHandler)({ res, data: { chat } });
    };
}
exports.ChatServices = ChatServices;

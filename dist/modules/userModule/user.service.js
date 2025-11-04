"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
const s3_service_1 = require("../../utils/multer/s3.service");
const successHandler_1 = require("../../utils/successHandler");
const Error_1 = require("../../utils/Error");
const auth_repo_1 = require("../authModule/auth.repo");
const friendRequest_repo_1 = require("../../DB/repos/friendRequest.repo");
const chat_repo_1 = require("../chatModule/chat.repo");
class UserServices {
    userModel = new auth_repo_1.UserRepo();
    chatModel = new chat_repo_1.ChatRepo();
    friendRequestModel = new friendRequest_repo_1.FriendRequestRepo();
    profileImage = async (req, res, next) => {
        const user = res.locals.user;
        const path = await (0, s3_service_1.uploadSingleFile)({ file: req.file, path: 'profile-images' });
        user.profileImage = path;
        await user.save();
        (0, successHandler_1.successHandler)({ res, data: path });
    };
    deleteSingleFile = async (req, res, next) => {
        const key = req.query;
        return await (0, s3_service_1.deleteFile)({ Bucket: process.env.BUCKET_NAME, Key: key });
    };
    deleteMultipleFiles = async (req, res, next) => {
        const results = await (0, s3_service_1.deleteFiles)({ urls: req.body.urls });
        return (0, successHandler_1.successHandler)({ res, data: results });
    };
    coverImages = async (req, res, next) => {
        const user = res.locals.user;
        const path = await (0, s3_service_1.uploadMultiFiles)({ files: req.files, path: 'cover-images' });
        user.coverImages = path;
        await user.save();
        (0, successHandler_1.successHandler)({ res, data: path });
    };
    sendFriendRequest = async (req, res, next) => {
        const authUser = res.locals.user;
        const { to } = req.body;
        if (authUser._id.toString() === to) {
            throw new Error_1.applicationError('you can not send friend request to yourself', 400);
        }
        const friend = await this.userModel.findById({ id: to });
        if (!friend)
            throw new Error_1.NotFoundException('user not found');
        const isFriendRequestExist = await this.friendRequestModel.findOne({
            filter: {
                $or: [
                    { to: authUser._id, from: to },
                    { to: to, from: authUser._id },
                ],
                acceptedAt: { $exists: false }
            }
        });
        if (isFriendRequestExist) {
            throw new Error_1.applicationError('you have already sent friend request', 400);
        }
        const request = await this.friendRequestModel.create({
            data: {
                from: authUser._id,
                to
            }
        });
        if (!request) {
            throw new Error_1.applicationError('failed to send friend request', 500);
        }
        return (0, successHandler_1.successHandler)({ res, data: request.toJSON() });
    };
    acceptFriendReq = async (req, res, next) => {
        const user = res.locals.user;
        const friendRequestId = req.params.id;
        const request = await this.friendRequestModel.findOne({
            filter: {
                _id: friendRequestId,
                to: user._id,
                acceptedAt: { $exists: false }
            }
        });
        if (!request)
            throw new Error_1.applicationError('relation not found', 404);
        await user.updateOne({
            $addToSet: { friends: request.from }
        });
        await this.userModel.update({
            filter: {
                _id: request.from
            },
            data: {
                $addToSet: { friends: request.to }
            }
        });
        request.acceptedAt = new Date(Date.now());
        await request.save();
        return (0, successHandler_1.successHandler)({ res, });
    };
    deleteFriendReq = async (req, res, next) => {
        const user = res.locals.user;
        const friendRequestId = req.params.id;
        const request = await this.friendRequestModel.findOne({
            filter: {
                to: user._id,
                _id: friendRequestId,
                acceptedAt: { $exists: false }
            }
        });
        if (!request)
            throw new Error_1.applicationError('request not found', 404);
        await request.deleteOne();
        return (0, successHandler_1.successHandler)({ res });
    };
    unfriend = async (req, res, next) => {
        const user = res.locals.user;
        const friendId = req.params.id;
        if (user._id.toString() === friendId)
            throw new Error_1.applicationError('you can not unfriend yourself', 400);
        const friend = await this.userModel.findOne({
            filter: {
                _id: friendId,
                friends: { $in: [user._id] }
            }
        });
        if (!friend)
            throw new Error_1.applicationError('user not found', 404);
        await Promise.all([
            user.updateOne({
                $pull: { friends: friendId }
            }),
            this.userModel.update({
                filter: {
                    _id: friendId
                },
                data: {
                    $pull: { friends: user._id }
                }
            })
        ]);
        return (0, successHandler_1.successHandler)({ res });
    };
    blockUser = async (req, res, next) => {
        const user = res.locals.user;
        const block = req.params.id;
        if (user._id.toString() === block)
            throw new Error_1.applicationError('you can not block yourself', 400);
        const updatedUser = await this.userModel.update({
            filter: {
                _id: user._id
            },
            data: {
                $addToSet: { blockList: block }
            }
        });
        return (0, successHandler_1.successHandler)({ res });
    };
    unblockUser = async (req, res, next) => {
        const user = res.locals.user;
        const unblock = req.params.id;
        const updatedUser = await this.userModel.update({
            filter: {
                _id: user._id
            },
            data: {
                $pull: { blockList: unblock }
            }
        });
        return (0, successHandler_1.successHandler)({ res });
    };
    profile = async (req, res, next) => {
        const userId = res.locals.user._id;
        const user = await this.userModel.findOne({
            filter: { _id: userId },
            options: { populate: 'friends' }
        });
        if (!user) {
            throw new Error_1.applicationError('user not found', 404);
        }
        const groups = await this.chatModel.find({
            filter: {
                participants: {
                    $in: [user._id]
                },
                group: {
                    $exists: true
                }
            }
        });
        return (0, successHandler_1.successHandler)({ res, data: { user, groups } });
    };
}
exports.UserServices = UserServices;

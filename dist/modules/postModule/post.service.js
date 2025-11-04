"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostServices = void 0;
const successHandler_1 = require("../../utils/successHandler");
const post_repo_1 = require("./post.repo");
const auth_repo_1 = require("../authModule/auth.repo");
const s3_service_1 = require("../../utils/multer/s3.service");
const nanoid_1 = require("nanoid");
const mongoose_1 = require("mongoose");
const post_types_1 = require("./post.types");
const Error_1 = require("../../utils/Error");
const comment_repo_1 = require("../commentModule/comment.repo");
class PostServices {
    postModel = new post_repo_1.PostRepo();
    userModel = new auth_repo_1.UserRepo();
    commentModel = new comment_repo_1.CommentRepo();
    constructor() { }
    createPost = async (req, res, next) => {
        const { tags = [] } = req.body;
        const files = req.files;
        if (tags.length > 0) {
            const users = await this.userModel.find({
                filter: {
                    _id: { $in: tags }
                }
            });
            if (users?.length != tags.length) {
                throw new Error('there is some tags not found');
            }
        }
        const assetsFolderId = (0, nanoid_1.nanoid)(15);
        const path = `users/${res.locals.user._id}/posts/${assetsFolderId}`;
        let attachments = [];
        if (files?.length > 0) {
            attachments = await (0, s3_service_1.uploadMultiFiles)({ files, path: path });
        }
        const post = await this.postModel.create({
            data: {
                ...req.body,
                attachments,
                assetsFolderId,
                createdBy: res.locals.user._id
            }
        });
        return (0, successHandler_1.successHandler)({ res, data: post });
    };
    like_unlikePost = async (req, res, next) => {
        const { postId, likeType } = req.body;
        const user = res.locals.user;
        const post = await this.postModel.findOne({
            filter: {
                _id: postId,
                $or: (0, post_types_1.AvailabilityCondition)(user)
            }
        });
        if (!post) {
            throw new Error_1.NotFoundException('post not found');
        }
        if (likeType === 'like') {
            await post.updateOne({ $addToSet: { likes: user._id } });
        }
        else {
            await post.updateOne({ $pull: { likes: user._id } });
        }
        await post.save();
        return (0, successHandler_1.successHandler)({ res });
    };
    updatePost = async (req, res, next) => {
        const postId = req.params.id;
        const user = res.locals.user;
        const { content, availability, removedAttachments, newTags, removedTags, allowComments } = req.body;
        const post = await this.postModel.findOne({
            filter: {
                _id: postId,
                createdBy: user._id
            }
        });
        if (!post) {
            throw new Error_1.NotFoundException('post not found');
        }
        let attachmentsLink = [];
        const newAttachments = req.files;
        if (newTags && newTags.length > 0) {
            const users = await this.userModel.find({
                filter: {
                    _id: { $in: newTags }
                }
            });
            if (users?.length != newTags.length) {
                throw new Error('there is some tags not found');
            }
        }
        if (newAttachments.length) {
            attachmentsLink = await (0, s3_service_1.uploadMultiFiles)({
                files: newAttachments,
                path: `users/${user._id}/posts/${post.assetsFolderId}`
            });
        }
        await post.updateOne([
            {
                $set: {
                    content: content || post.content,
                    availability: availability || post.availability,
                    allowComments: allowComments || post.allowComments,
                    attachments: {
                        $setUnion: [
                            { $setDifference: ["$attachments", removedAttachments || []] },
                            attachmentsLink || []
                        ]
                    },
                    tags: {
                        $setUnion: [
                            {
                                $setDifference: [
                                    "$tags",
                                    (removedTags || []).map((tag) => mongoose_1.Types.ObjectId.createFromHexString(tag))
                                ]
                            },
                            (newTags || []).map((tag) => mongoose_1.Types.ObjectId.createFromHexString(tag))
                        ]
                    }
                }
            }
        ]);
        return (0, successHandler_1.successHandler)({ res });
    };
    getPostById = async (req, res, next) => {
        const postId = req.params.id;
        const post = await this.postModel.findOne({
            filter: {
                _id: postId,
                isDeleted: false
            }
        });
        if (!post) {
            throw new Error_1.NotFoundException('post not found');
        }
        if (!post.createdBy.equals(res.locals.user._id)) {
            console.log(1);
            const userAuth = await this.userModel.findOne({
                filter: {
                    _id: post.createdBy,
                }
            });
            if (userAuth?.blockList.includes(res.locals.user._id)) {
                throw new Error_1.applicationError('you are blocked by this user', 400);
            }
            if (post.availability === post_types_1.postAvailabilityEnum.PRIVATE) {
                throw new Error_1.applicationError('you are not allowed to view this post', 400);
            }
            if (post.availability === post_types_1.postAvailabilityEnum.FRIENDS && !res.locals.user.friends.includes(post.createdBy)) {
                throw new Error_1.applicationError('you are not allowed to view this post', 400);
            }
        }
        return (0, successHandler_1.successHandler)({ res, data: post });
    };
    softDelete = async (req, res, next) => {
        const postId = req.params.id;
        const post = await this.postModel.findOne({
            filter: {
                _id: postId,
                createdBy: res.locals.user._id
            }
        });
        if (!post) {
            throw new Error_1.NotFoundException('post not found');
        }
        if (post.isDeleted) {
            throw new Error_1.applicationError('post already deleted', 400);
        }
        await this.commentModel.update({
            filter: {
                postId: post._id
            },
            data: {
                isDeleted: true
            }
        });
        await post.updateOne({ isDeleted: true });
        return (0, successHandler_1.successHandler)({ res });
    };
    hardDelete = async (req, res, next) => {
        const postId = req.params.id;
        const post = await this.postModel.findOne({
            filter: {
                _id: postId,
                createdBy: res.locals.user._id
            }
        });
        if (!post) {
            throw new Error_1.NotFoundException('post not found');
        }
        const comment = await this.commentModel.find({
            filter: {
                postId: post._id
            }
        });
        if (comment.length > 0) {
            await this.commentModel.deleteMany({
                filter: {
                    postId: post._id
                }
            });
        }
        await post.deleteOne();
        return (0, successHandler_1.successHandler)({ res });
    };
}
exports.PostServices = PostServices;

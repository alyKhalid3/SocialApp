"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentServices = void 0;
const successHandler_1 = require("../../utils/successHandler");
const auth_repo_1 = require("../authModule/auth.repo");
const mongoose_1 = require("mongoose");
const Error_1 = require("../../utils/Error");
const post_repo_1 = require("../postModule/post.repo");
const comment_repo_1 = require("./comment.repo");
const post_types_1 = require("../postModule/post.types");
const s3_service_1 = require("../../utils/multer/s3.service");
const node_console_1 = require("node:console");
class CommentServices {
    postModel = new post_repo_1.PostRepo();
    userModel = new auth_repo_1.UserRepo();
    commentModel = new comment_repo_1.CommentRepo();
    constructor() { }
    createComment = async (req, res, next) => {
        const postId = req.params.id;
        const { tags } = req.body;
        const files = req.files;
        const post = await this.postModel.findOne({
            filter: {
                _id: postId,
                allowComments: true,
                availability: post_types_1.postAvailabilityEnum.PUBLIC
            }
        });
        if (!post) {
            throw new Error_1.NotFoundException('post not found');
        }
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
        const path = `users/${post?.createdBy}/comments/${post?.assetsFolderId}`;
        let attachments = [];
        if (files?.length > 0) {
            attachments = await (0, s3_service_1.uploadMultiFiles)({ files, path: path });
        }
        const comment = await this.commentModel.create({
            data: {
                ...req.body,
                postId,
                attachments,
                createdBy: res.locals.user._id
            }
        });
        if (!comment) {
            throw new Error_1.applicationError('comment not created', 400);
        }
        return (0, successHandler_1.successHandler)({ res });
    };
    updateComment = async (req, res, next) => {
        const commentId = req.params.id;
        const user = res.locals.user;
        const { content, removedAttachments, newTags, removedTags, } = req.body;
        const comment = await this.commentModel.findOne({
            filter: {
                _id: commentId,
                createdBy: user._id
            },
            options: {
                populate: [{
                        path: 'postId',
                    }]
            }
        });
        const post = comment?.postId;
        if (!comment) {
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
                path: `users/${user._id}/comment/${post.assetsFolderId}`
            });
        }
        await comment.updateOne([
            {
                $set: {
                    content: content || post.content,
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
    createReply = async (req, res, next) => {
        const { id, commentId } = req.params;
        const postId = id;
        (0, node_console_1.log)(postId, commentId);
        const { tags } = req.body;
        const files = req.files;
        const comment = await this.commentModel.findOne({
            filter: {
                _id: commentId,
                postId
            },
            options: {
                populate: [{
                        path: "postId",
                        match: {
                            allowComments: true,
                            availability: post_types_1.postAvailabilityEnum.PUBLIC
                        }
                    }]
            }
        });
        if (!comment) {
            throw new Error_1.NotFoundException('comment not found');
        }
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
        let attachments = [];
        if (files?.length > 0) {
            const post = comment.postId;
            const path = `users/${post?.createdBy}/comments/${post?.assetsFolderId}`;
            attachments = await (0, s3_service_1.uploadMultiFiles)({ files, path: path });
        }
        const reply = await this.commentModel.create({
            data: {
                ...req.body,
                postId,
                commentId,
                attachments,
                createdBy: res.locals.user._id
            }
        });
        if (!reply) {
            throw new Error_1.applicationError('failed to create reply', 400);
        }
        return (0, successHandler_1.successHandler)({ res });
    };
    getComment = async (req, res, next) => {
        const { commentId } = req.params;
        const comment = await this.commentModel.findOne({
            filter: {
                _id: commentId,
                isDeleted: false
            },
            options: {
                populate: [{
                        path: "postId",
                        match: {
                            isDeleted: false
                        }
                    }]
            }
        });
        if (!comment) {
            throw new Error_1.NotFoundException('comment not found');
        }
        return (0, successHandler_1.successHandler)({ res, data: comment });
    };
    getCommentWithReply = async (req, res, next) => {
        const { commentId } = req.params;
        const comment = await this.commentModel.findOne({
            filter: {
                _id: commentId
            },
            options: {
                populate: [{
                        path: 'replies'
                    }]
            }
        });
        if (!comment) {
            throw new Error_1.NotFoundException('comment not found');
        }
        return (0, successHandler_1.successHandler)({ res, data: comment });
    };
    softDelete = async (req, res, next) => {
        const commentId = req.params.id;
        const comment = await this.commentModel.findOne({
            filter: {
                _id: commentId,
                createdBy: res.locals.user._id
            },
            options: {
                populate: [
                    {
                        path: 'replies'
                    }
                ]
            }
        });
        if (!comment) {
            throw new Error_1.NotFoundException('comment not found');
        }
        const replies = comment?.replies;
        if (replies?.length > 0) {
            await this.commentModel.updateMany({
                filter: {
                    _id: { $in: replies.map(reply => reply._id) }
                },
                data: {
                    isDeleted: true
                }
            });
        }
        if (comment.isDeleted) {
            throw new Error_1.applicationError('comment already deleted', 400);
        }
        await comment.updateOne({ isDeleted: true });
        return (0, successHandler_1.successHandler)({ res });
    };
    hardDelete = async (req, res, next) => {
        const commentId = req.params.id;
        const comment = await this.commentModel.findOne({
            filter: {
                _id: commentId,
                createdBy: res.locals.user._id
            },
            options: {
                populate: [
                    {
                        path: 'replies'
                    }
                ]
            }
        });
        if (!comment) {
            throw new Error_1.NotFoundException('comment not found');
        }
        const replies = comment?.replies;
        if (replies?.length > 0) {
            await this.commentModel.deleteMany({
                filter: {
                    _id: { $in: replies.map(reply => reply._id) }
                }
            });
        }
        await comment.deleteOne();
        return (0, successHandler_1.successHandler)({ res });
    };
}
exports.CommentServices = CommentServices;

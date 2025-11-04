import { postModel } from './../../DB/models/post.model';
import { NextFunction, Request, Response } from "express";
import { successHandler } from "../../utils/successHandler";
import { UserRepo } from '../authModule/auth.repo';
import { HydratedDocument, Types } from 'mongoose';
import { IUser } from '../../DB/models/user.model';
import { applicationError, NotFoundException } from '../../utils/Error';
import { PostRepo } from '../postModule/post.repo';
import { CommentRepo } from './comment.repo';
import { IPost, postAvailabilityEnum } from '../postModule/post.types';
import { nanoid } from 'nanoid';
import { deleteFile, uploadMultiFiles } from '../../utils/multer/s3.service';
import { log } from 'node:console';
import { IComment } from '../../DB/models/comment.model';
import { updateCommentDTO } from './comment.dto';




interface ICommentServices {
    createComment(req: Request, res: Response, next: NextFunction): Promise<Response>
}
export class CommentServices implements ICommentServices {
    private postModel = new PostRepo()
    private userModel = new UserRepo()
    private commentModel = new CommentRepo()

    constructor() { }
    createComment = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const postId = req.params.id
        const { tags } = req.body
        const files = req.files as Express.Multer.File[]
        const post = await this.postModel.findOne({
            filter: {
                _id: postId,
                allowComments: true,
                availability: postAvailabilityEnum.PUBLIC
            }

        })
        if (!post) {
            throw new NotFoundException('post not found')
        }
        if (tags.length > 0) {
            const users = await this.userModel.find({
                filter: {
                    _id: { $in: tags }
                }
            })

            if (users?.length != tags.length) {
                throw new Error('there is some tags not found')
            }

        }
        const path = `users/${post?.createdBy}/comments/${post?.assetsFolderId}`
        let attachments: string[] = []
        if (files?.length > 0) {
            attachments = await uploadMultiFiles({ files, path: path })
        }
        const comment = await this.commentModel.create({
            data: {
                ...req.body,
                postId,
                attachments,
                createdBy: res.locals.user._id
            }
        })
        if (!comment) {
            throw new applicationError('comment not created', 400)
        }
        return successHandler({ res })
    }
    updateComment = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
           const commentId = req.params.id
                const user = res.locals.user
                const {
                    content,
                    removedAttachments,
                    newTags,
                    removedTags,
                }:updateCommentDTO = req.body
                const comment = await this.commentModel.findOne({
                    filter: {
                        _id: commentId,
                        createdBy: user._id
                    },
                    options:{
                        populate:[{
                            path:'postId',
                        }]
                    }
                })
                const post=comment?.postId as HydratedDocument<IPost>
                if (!comment) {
                    throw new NotFoundException('post not found')
                }
                let attachmentsLink: string[] = []
                const newAttachments = (req.files as Express.Multer.File[])
                if (newTags && newTags.length > 0) {
                    const users = await this.userModel.find({
                        filter: {
                            _id: { $in: newTags }
                        }
                    })
        
                    if (users?.length != newTags.length) {
                        throw new Error('there is some tags not found')
                    }
        
                }
                if (newAttachments.length) {
                    attachmentsLink = await uploadMultiFiles({
                        files: newAttachments,
                        path: `users/${user._id}/comment/${post.assetsFolderId}`
                    })
                }
            
                await comment.updateOne(
                    [
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
                                                (removedTags || []).map((tag: string) => Types.ObjectId.createFromHexString(tag))
                                            ]
                                        },
                                        (newTags || []).map((tag: string) => Types.ObjectId.createFromHexString(tag))
                                    ]
                                }
                            }
                        }
                    ],
        
                );
        
        
                return successHandler({ res })
    }
    createReply = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { id, commentId } = req.params
        const postId = id
        log(postId, commentId)
        const { tags } = req.body
        const files = req.files as Express.Multer.File[]
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
                        availability: postAvailabilityEnum.PUBLIC
                    }

                }]
            }
        })

        if (!comment) {
            throw new NotFoundException('comment not found')
        }
        if (tags.length > 0) {
            const users = await this.userModel.find({
                filter: {
                    _id: { $in: tags }
                }
            })

            if (users?.length != tags.length) {
                throw new Error('there is some tags not found')
            }


        }
        let attachments: string[] = []
        if (files?.length > 0) {
            const post = comment.postId as HydratedDocument<IPost>
            const path = `users/${post?.createdBy}/comments/${post?.assetsFolderId}`
            attachments = await uploadMultiFiles({ files, path: path })
        }
        const reply = await this.commentModel.create({
            data: {
                ...req.body,
                postId,
                commentId,
                attachments,
                createdBy: res.locals.user._id
            }
        })
        if (!reply) {
            throw new applicationError('failed to create reply', 400)
        }

        return successHandler({ res })
    }

    getComment = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { commentId } = req.params
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
        })
        if (!comment) {
            throw new NotFoundException('comment not found')
        }
        return successHandler({ res, data: comment })
    }
    getCommentWithReply = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { commentId } = req.params
        const comment = await this.commentModel.findOne({
            filter: {
                _id: commentId
            },
            options: {
                populate: [{
                    path: 'replies'
                }]
            }
        })
        if (!comment) {
            throw new NotFoundException('comment not found')
        }
        return successHandler({ res, data: comment })
    }
    softDelete = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const commentId = req.params.id
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
        })
        if (!comment) {
            throw new NotFoundException('comment not found')
        }
        const replies = comment?.replies as HydratedDocument<IComment>[]
        if (replies?.length > 0) {
            await this.commentModel.updateMany({
                filter: {
                    _id: { $in: replies.map(reply => reply._id) }
                },
                data: {
                    isDeleted: true 
                }
            })
        }
        if (comment.isDeleted) {
            throw new applicationError('comment already deleted', 400)
        }
        await comment.updateOne({ isDeleted: true })

        return successHandler({ res })
    }
    hardDelete = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const commentId = req.params.id
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
        })
        if (!comment) {
            throw new NotFoundException('comment not found')
        }
        const replies = comment?.replies as HydratedDocument<IComment>[]
        if (replies?.length > 0) {
            await this.commentModel.deleteMany({
                filter: {
                    _id: { $in: replies.map(reply => reply._id) }
                }
            })
        }
        await comment.deleteOne()
        return successHandler({ res })
    }
}



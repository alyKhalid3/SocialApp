import { NextFunction, Request, Response } from "express";
import { successHandler } from "../../utils/successHandler";
import { PostRepo } from './post.repo';
import { createPostDTO, likeUnlikePostDTO, updatePostDTO } from './post.DTO';
import { UserRepo } from '../authModule/auth.repo';
import { uploadMultiFiles } from '../../utils/multer/s3.service';
import { nanoid } from 'nanoid';
import { unknown } from 'zod';
import { HydratedDocument, Types } from 'mongoose';
import { IUser } from '../../DB/models/user.model';
import { AvailabilityCondition, postAvailabilityEnum } from './post.types';
import { applicationError, NotFoundException } from '../../utils/Error';
import { CommentRepo } from '../commentModule/comment.repo';
import { postModel } from "../../DB/models/post.model";




interface IPostServices {
    createPost(req: Request, res: Response, next: NextFunction): Promise<Response>
    like_unlikePost(req: Request, res: Response, next: NextFunction): Promise<Response>
}
export class PostServices implements IPostServices {
    private postModel = new PostRepo()
    private userModel = new UserRepo()
    private commentModel = new CommentRepo()

    constructor() { }

    createPost = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { tags = [] }: createPostDTO = req.body
        const files = req.files as Express.Multer.File[]

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
        const assetsFolderId = nanoid(15)
        const path = `users/${res.locals.user._id}/posts/${assetsFolderId}`
        let attachments: string[] = []
        if (files?.length > 0) {
            attachments = await uploadMultiFiles({ files, path: path })
        }
        const post = await this.postModel.create({
            data: {
                ...req.body,
                attachments,
                assetsFolderId,
                createdBy: res.locals.user._id
            }
        })
        return successHandler({ res, data: post })
    }
    like_unlikePost = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { postId, likeType }: likeUnlikePostDTO= req.body
        const user: HydratedDocument<IUser> = res.locals.user
        const post = await this.postModel.findOne({
            filter: {
                _id: postId,
                $or: AvailabilityCondition(user)
            }
        })

        if (!post) {
            throw new NotFoundException('post not found')
        }
        if (likeType === 'like') {
            await post.updateOne({ $addToSet: { likes: user._id } })
        }
        else {
            await post.updateOne({ $pull: { likes: user._id } })
        }
        await post.save()

        return successHandler({ res })
    }
    updatePost = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {

        const postId = req.params.id
        const user = res.locals.user
        const {
            content,
            availability,
            removedAttachments,
            newTags,
            removedTags,
            allowComments
        }: updatePostDTO = req.body
        const post = await this.postModel.findOne({
            filter: {
                _id: postId,
                createdBy: user._id
            }
        })
        if (!post) {
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
                path: `users/${user._id}/posts/${post.assetsFolderId}`
            })
        }
    


        await post.updateOne(
            [
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
    getPostById = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {

        const postId = req.params.id
        const post = await this.postModel.findOne({
            filter: {
                _id: postId,
                isDeleted: false
            }
        })
        if (!post) {
            throw new NotFoundException('post not found')
        }
        if (!post.createdBy.equals(res.locals.user._id)) {
            console.log(1);

            const userAuth = await this.userModel.findOne({
                filter: {
                    _id: post.createdBy,
                }
            })
            if (userAuth?.blockList.includes(res.locals.user._id)) {
                throw new applicationError('you are blocked by this user', 400)
            }
            if (post.availability === postAvailabilityEnum.PRIVATE) {
                throw new applicationError('you are not allowed to view this post', 400)
            }
            if (post.availability === postAvailabilityEnum.FRIENDS && !res.locals.user.friends.includes(post.createdBy)) {
                throw new applicationError('you are not allowed to view this post', 400)
            }

        }

        return successHandler({ res, data: post })
    }
    softDelete = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const postId = req.params.id
        const post = await this.postModel.findOne({
            filter: {
                _id: postId,
                createdBy: res.locals.user._id
            }
        })
        if (!post) {
            throw new NotFoundException('post not found')
        }
        if (post.isDeleted) {
            throw new applicationError('post already deleted', 400)
        }
        await this.commentModel.update({
            filter: {
                postId: post._id
            },
            data: {
                isDeleted: true
            }
        })
        await post.updateOne({ isDeleted: true })


        return successHandler({ res })
    }
    hardDelete = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const postId = req.params.id
        const post = await this.postModel.findOne({
            filter: {
                _id: postId,
                createdBy: res.locals.user._id
            }
        })
        if (!post) {
            throw new NotFoundException('post not found')
        }
        const comment = await this.commentModel.find({
            filter: {
                postId: post._id
            }
        })
        if (comment.length > 0) {
            await this.commentModel.deleteMany({
                filter: {
                    postId: post._id
                }
            })
        }

        await post.deleteOne()

        return successHandler({ res })
    }
}



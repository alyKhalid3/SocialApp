import { NextFunction, Response, Request } from "express";
import { createPreSignUrl, uploadMultiFiles, uploadSingleFile, uploadSingleLargeFile, deleteFile, deleteFiles } from "../../utils/multer/s3.service";
import { successHandler } from "../../utils/successHandler";
import { HydratedDocument, Types } from "mongoose";
import { IUser } from "../../DB/models/user.model";
import { DeleteObjectCommandOutput } from "@aws-sdk/client-s3";
import { applicationError, NotFoundException } from '../../utils/Error';
import { UserRepo } from '../authModule/auth.repo';
import { FriendRequestRepo } from '../../DB/repos/friendRequest.repo';
import { ChatRepo } from '../chatModule/chat.repo';




export class UserServices {
    private userModel = new UserRepo()
    private chatModel = new ChatRepo()
    private friendRequestModel = new FriendRequestRepo()
    profileImage = async (req: Request, res: Response, next: NextFunction) => {
        const user = res.locals.user as HydratedDocument<IUser>
        const path = await uploadSingleFile({ file: req.file as Express.Multer.File, path: 'profile-images' })
        user.profileImage = path
        await user.save()
        successHandler({ res, data: path })
    }
    deleteSingleFile = async (req: Request, res: Response, next: NextFunction): Promise<DeleteObjectCommandOutput> => {
        const key: string = req.query as unknown as string
        return await deleteFile({ Bucket: process.env.BUCKET_NAME as string, Key: key })
    }
    deleteMultipleFiles = async (req: Request, res: Response, next: NextFunction) => {
        const results = await deleteFiles({ urls: req.body.urls as string[] })
        return successHandler({ res, data: results })
    }
    coverImages = async (req: Request, res: Response, next: NextFunction) => {
        const user = res.locals.user as HydratedDocument<IUser>
        const path = await uploadMultiFiles({ files: req.files as Express.Multer.File[], path: 'cover-images' })
        user.coverImages = path
        await user.save()
        successHandler({ res, data: path })
    }
    sendFriendRequest = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const authUser: HydratedDocument<IUser> = res.locals.user
        const { to } = req.body
        if (authUser._id.toString() === to) {
            throw new applicationError('you can not send friend request to yourself', 400)
        }
        const friend = await this.userModel.findById({ id: to })
        if (!friend)
            throw new NotFoundException('user not found')
        const isFriendRequestExist = await this.friendRequestModel.findOne({
            filter: {
                $or: [
                    { to: authUser._id, from: to },
                    { to: to, from: authUser._id },

                ],
                acceptedAt: { $exists: false }
            }
        })
        if (isFriendRequestExist) {
            throw new applicationError('you have already sent friend request', 400)
        }
        const request = await this.friendRequestModel.create({
            data: {
                from: authUser._id,
                to
            }
        })
        if (!request) {
            throw new applicationError('failed to send friend request', 500)
        }
        return successHandler({ res, data: request.toJSON() })
    }
    acceptFriendReq = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const user: HydratedDocument<IUser> = res.locals.user
        const friendRequestId = req.params.id
        const request = await this.friendRequestModel.findOne({
            filter: {
                _id: friendRequestId,
                to: user._id,
                acceptedAt: { $exists: false }
            }
        })

        if (!request)
            throw new applicationError('relation not found', 404)
        await user.updateOne({ //to
            $addToSet: { friends: request.from }
        })
        await this.userModel.update({ //from
            filter: {
                _id: request.from
            },
            data: {
                $addToSet: { friends: request.to }
            }
        })
        request.acceptedAt = new Date(Date.now())
        await request.save()

        return successHandler({ res, })
    }
    deleteFriendReq = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const user: HydratedDocument<IUser> = res.locals.user
        const friendRequestId = req.params.id
        const request = await this.friendRequestModel.findOne({
            filter: {
                to: user._id,
                _id: friendRequestId,
                acceptedAt: { $exists: false }
            }
        }
        )
        if (!request)
            throw new applicationError('request not found', 404)
        await request.deleteOne()

        return successHandler({ res })
    }
    unfriend = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const user: HydratedDocument<IUser> = res.locals.user
        const friendId = req.params.id
        if (user._id.toString() === friendId)
            throw new applicationError('you can not unfriend yourself', 400)
        const friend = await this.userModel.findOne({
            filter:
            {
                _id: friendId,
                friends: { $in: [user._id] }
            }
        })
        if (!friend)
            throw new applicationError('user not found', 404)
        await Promise.all([
            user.updateOne({
                $pull: { friends: friendId }
            })
            , this.userModel.update({
                filter: {
                    _id: friendId
                },
                data: {
                    $pull: { friends: user._id }
                }
            })
        ])



        return successHandler({ res })
    }
    blockUser = async (req: Request, res: Response, next: NextFunction) => {
        const user: HydratedDocument<IUser> = res.locals.user
        const block = req.params.id
        if (user._id.toString() === block)
            throw new applicationError('you can not block yourself', 400)
        const updatedUser = await this.userModel.update({
            filter: {
                _id: user._id
            },
            data: {
                $addToSet: { blockList: block }
            }
        })
        return successHandler({ res })
    }
    unblockUser = async (req: Request, res: Response, next: NextFunction) => {
        const user: HydratedDocument<IUser> = res.locals.user
        const unblock = req.params.id
        const updatedUser = await this.userModel.update({
            filter: {
                _id: user._id
            },
            data: {
                $pull: { blockList: unblock }
            }
        })
        return successHandler({ res })
    }
    profile = async (req: Request, res: Response, next: NextFunction) => {
        const userId: string = res.locals.user._id
        const user = await this.userModel.findOne({
            filter: { _id: userId },
            options: { populate: 'friends' }
        })
        if (!user) {
            throw new applicationError('user not found', 404)
        }
        const groups = await this.chatModel.find({
            filter: {
                participants: {
                    $in: [user._id as Types.ObjectId]
                },
                group: {
                    $exists: true
                }

            }
        })
        return successHandler({ res, data: { user, groups } })
    }
}
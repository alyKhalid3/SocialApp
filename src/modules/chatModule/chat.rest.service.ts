import { string } from 'zod';
import { Request, Response } from 'express';
import { UserRepo } from '../authModule/auth.repo';
import { BadRequestException, NotFoundException } from '../../utils/Error';
import { ChatRepo } from './chat.repo';
import { successHandler } from '../../utils/successHandler';
import { Types } from 'mongoose';
import { nanoid } from 'nanoid';






export class ChatServices {
    private userModel = new UserRepo()
    private chatModel = new ChatRepo()
    constructor() { }

    getChat = async (req: Request, res: Response) => {
        const loggedUser = res.locals.user
        const userId = Types.ObjectId.createFromHexString(req.params.userId as string)
        console.log({
            userId: userId,
            loggedUser: loggedUser._id
        });

        const to = await this.userModel.findOne({
            filter: {
                _id: userId,
            }
        })
        if (!to) {
            throw new NotFoundException('user not found')
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
        })
        if (!chat) {
            const newChat = await this.chatModel.create({
                data: {
                    participants: [to._id, loggedUser._id],
                    createdBy: loggedUser._id,
                    messages: []
                }
            })
            return successHandler({ res, data: newChat })
        }
        return successHandler({ res, data: chat })

    }
    createGroupChat = async (req: Request, res: Response) => {
        const user = res.locals.user
        const { group, participants }: { group: string, participants: string[] } = req.body
        const mutualParticipants = await this.userModel.find({
            filter: {
                _id: { $in: participants }
            }
        })
        if (mutualParticipants.length !== participants.length) {
            throw new NotFoundException('some participants not found')
        }
        const roomId = nanoid(15)
        const newGroup = await this.chatModel.create({
            data: {
                participants: [...mutualParticipants.map((participant) => participant._id), user._id],
                group,
                createdBy: user._id,
                roomId

            }

        })
        if (!newGroup) {
            throw new BadRequestException('group not created')
        }

        return successHandler({ res, data: newGroup })
    }
    getGroupChat = async (req: Request, res: Response) => {
        const user = res.locals.user
        const { groupId } = req.params
        const chat = await this.chatModel.findOne({
            filter: {
                group: { $exists: true },
                _id: groupId,
                participants: { $in: [user._id as Types.ObjectId] }
            },
            options: { 
                populate:"messages.createdBy"
            }

        })
        if (!chat) {
            throw new NotFoundException('group not found')
        }
        return successHandler({ res, data: { chat } })
    }
}
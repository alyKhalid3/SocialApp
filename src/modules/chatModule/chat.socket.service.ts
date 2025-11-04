import { sendGroupMessageSchema } from './chat.validation';
import { userModel } from './../../DB/models/user.model';
import { UserServices } from './../userModule/user.service';
import { AuthenticatedSocket, connectedSockets } from "../gateway/gateway";
import { UserRepo } from '../authModule/auth.repo';
import { ChatRepo } from './chat.repo';
import { NotFoundException } from '../../utils/Error';
import { sendGroupMessageDTO, sendMessageDTO } from './chat.dto';





export class ChatSocketService {
    private userModel = new UserRepo()
    private chatModel = new ChatRepo()
    constructor() { }

    sendMessage = async (socket: AuthenticatedSocket, data: sendMessageDTO) => {
        try {
            const createdBy = socket.user?._id
            const to = await this.userModel.findById({
                id: data.sendTo
            })

            const chat = await this.chatModel.findOne({
                filter: {
                    participants: {
                        $all: [to?._id, createdBy]
                    },
                    group: {
                        $exists: false
                    }
                }
            })
            if (!chat) {
                throw new NotFoundException('chat not found')
            }
            await chat.updateOne({
                $push: {
                    messages: { content: data.content, createdBy: createdBy }
                }
            })
            socket.emit('successMessage', data.content)
            socket.to(connectedSockets.get(to?._id.toString() as string) || []).emit('newMessage', {
                content: data.content,
                from: socket.user
            })
        } catch (error) {
            socket.emit('customError', error)
        }
    }


    joinRoom = async (socket: AuthenticatedSocket, roomId: string) => {
        try {
            const group = await this.chatModel.findOne({
                filter: {
                    roomId,
                    participants: {
                        $in: [socket.user?._id]
                    },
                    group: {
                        $exists: true
                    }
                }

            })
            if (!group) {
                throw new NotFoundException('group not found')
            }
            socket.join(group.roomId)
        } catch (error) {
            socket.emit('customError', error)
        }
    }
    sendGroupMessage = async (socket: AuthenticatedSocket, data: sendGroupMessageDTO) => {
        try {
            const createdBy = socket.user?._id
            const group = await this.chatModel.findOne({
                filter: {
                    _id: data.groupId,
                    participants: {
                        $in: [socket.user?._id]
                    },
                    group: {
                        $exists: true
                    }
                }
            })
            if (!group) {
                throw new NotFoundException('group not found')
            }
            await group.updateOne({
                $push: {
                    messages: { content: data.content, createdBy: createdBy }
                }
            })
            socket.emit('successMessage', data.content)
            socket.to(group.roomId as string).emit('newMessage', {
                content: data.content,
                from: socket.user,
                groupId: group._id

            })

        } catch (error) {
            socket.emit('customError', error)
        }
    }
}
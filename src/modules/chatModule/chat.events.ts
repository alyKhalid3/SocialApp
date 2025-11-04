import { ChatSocketService } from './chat.socket.service';
import { AuthenticatedSocket } from "../gateway/gateway"
import { socketValidation } from '../../middleware/validation.middleware';
import { sendGroupMessageSchema, sendMessageSchema } from './chat.validation';





export class ChatEvent{
    private chatSocketService=new ChatSocketService()
    constructor(){}
   sendMessage=async(socket:AuthenticatedSocket)=>{
    socket.on('sendMessage',(data)=>{
      socketValidation(sendMessageSchema, this.chatSocketService.sendMessage.bind(this.chatSocketService))(socket,data)
    })
}
   joinRoom=async(socket:AuthenticatedSocket)=>{
    socket.on('join_room',({roomId})=>{
       return this.chatSocketService.joinRoom(socket,roomId)
    })}
    sendGroupMessage=async(socket:AuthenticatedSocket)=>{
        socket.on('sendGroupMessage',({content,groupId}:{content:string,groupId:string})=>{
          socketValidation(sendGroupMessageSchema, this.chatSocketService.sendGroupMessage.bind(this.chatSocketService))(socket,{content,groupId})
        })
    }
}
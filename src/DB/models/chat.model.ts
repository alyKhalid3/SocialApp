import { HydratedDocument, model, models, Schema, Types } from "mongoose";


export interface IMessage {
    createdBy: Types.ObjectId,
    content: string,
    createdAt: Date
    updatedAt: Date
}
const messageSchema=new Schema<IMessage>({
    createdBy:{type:Schema.Types.ObjectId,ref:'user',required:true},
    content:{type:String,required:true},
},{
    timestamps:true
})
export type HMessageDocument =HydratedDocument<IMessage>
    export interface IChat {
    participants: Types.ObjectId[],
    messages: IMessage[]

    group?: string,
    groupName: string
    roomId: string

    createdBy: Types.ObjectId
    createdAt: Date
    updatedAt: Date
}

const chatSchema = new Schema<IChat>({
    participants: [{ type: Schema.Types.ObjectId, ref: 'user' ,required:true}],
    messages: [messageSchema],

    group: { type: String },
    groupName: { type: String },
    roomId: { type: String },
    
    createdBy: { type: Schema.Types.ObjectId, ref: 'user', required: true },
   
},{
    timestamps: true
})
export type HChatDocument =HydratedDocument<IChat>


export const chatModel = models.chat || model<IChat>('chat', chatSchema)
export const messageModel=model<IMessage>('message',messageSchema)

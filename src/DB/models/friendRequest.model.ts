import { model, Schema, Types } from "mongoose"



export interface IFriendRequest {
    from: Types.ObjectId
    to: Types.ObjectId
    //   status:'pending'|'accepted'|'rejected'
    acceptedAt: Date
    createdAt: Date
    updatedAt: Date



}


const friendRequestSchema = new Schema<IFriendRequest>({
    from: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
    , to: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    acceptedAt: { type: Date },

}, {
    timestamps: true
})


export const friendRequestModel = model<IFriendRequest>('friendRequest', friendRequestSchema)
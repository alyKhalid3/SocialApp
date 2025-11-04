
import mongoose,{Types} from "mongoose";
import { IPost, postAvailabilityEnum } from "../../modules/postModule/post.types";

export interface IComment {
    content: string;
    attachments?: string[];

    createdBy: Types.ObjectId;
    postId: Types.ObjectId|Partial<IPost>;
    commentId?: Types.ObjectId;
    

    likes?: Types.ObjectId[];
    tags?: Types.ObjectId[];

    freezedBy?: Types.ObjectId;
    freezedAt?: Date;

    restoredBy?: Types.ObjectId;
    restoredAt?: Date;
    
    createdAt?: Date;
    updatedAt?: Date;

    isDeleted?:boolean,
    replies?:IComment[]
    
}
const commentSchema = new mongoose.Schema<IComment>({
    content: { type: String},
    attachments: [{ type: String }],

    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    postId:{type:mongoose.Schema.Types.ObjectId,ref:'post'},
    commentId:{type:mongoose.Schema.Types.ObjectId,ref:'comment'},
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }],
    tags:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }],
    freezedBy:{type:mongoose.Schema.Types.ObjectId,ref:'user'},
    freezedAt:{type:Date},
    restoredBy:{type:mongoose.Schema.Types.ObjectId,ref:'user'},
    restoredAt:{type:Date},
    
    isDeleted:{type:Boolean,default:false},
   
},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

commentSchema.virtual('replies',{
    ref:'comment',
    localField:'_id',
    foreignField:'commentId',
})

export const commentModel = mongoose.model<IComment>('comment',commentSchema)
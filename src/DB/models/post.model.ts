import mongoose,{Types} from "mongoose";
import { IPost, postAvailabilityEnum } from "../../modules/postModule/post.types";


const postSchema = new mongoose.Schema<IPost>({
    content: { type: String},
    attachments: [{ type: String }],
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    availability:{
        type:String,
        enum:[postAvailabilityEnum.PUBLIC,postAvailabilityEnum.PRIVATE,postAvailabilityEnum.FRIENDS],
        default:postAvailabilityEnum.PUBLIC
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }],
    tags:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }],
    allowComments:{type:Boolean,default:true},
    isDeleted:{type:Boolean,default:false},
    assetsFolderId:{type:String}

   
},{
    timestamps:true
})



export const postModel = mongoose.model<IPost>('post',postSchema)
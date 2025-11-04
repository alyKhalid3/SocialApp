import { HydratedDocument, Types } from "mongoose"
import { IUser } from "../../DB/models/user.model"

/**
 * createdBy
 * conent
 * attachments
 * comments
 * availability
 * likes
 * tags
 * allowComments
 * isDeleted
 * createdAt
 * updatedAt
 * assetsFolderId
 * 
 */
export const AvailabilityCondition = (user: HydratedDocument<IUser>) => {
   return [
        { availability: postAvailabilityEnum.PUBLIC },
        {
            availability: postAvailabilityEnum.FRIENDS,
           createdBy: {$in:[user._id, ...user.friends]}
        },
        {
            availability: postAvailabilityEnum.PRIVATE,
            createdBy: user._id
        }

    ]
}
export enum postAvailabilityEnum {
    PUBLIC = 'public',
    PRIVATE = 'private',
    FRIENDS = 'friends'
}
export interface IPost {
    content?: string
    attachments?: string[]
    createdBy: Types.ObjectId
    availability: postAvailabilityEnum
    likes: Array<Types.ObjectId>
    tags: Array<Types.ObjectId>
    allowComments: boolean
    isDeleted: boolean
    createdAt: Date
    updatedAt: Date
    assetsFolderId: string
}


export type PostDocument = HydratedDocument<IPost>

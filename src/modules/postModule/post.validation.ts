import z from 'zod'
import { postAvailabilityEnum } from './post.types'
import { DatabaseSync } from 'node:sqlite'
import { buffer } from 'stream/consumers'
import { generalValidation } from '../../utils/generalValidation'




export const createPostSchema = z.object({
    content: generalValidation.content,
    files: generalValidation.files({}),
    availability: generalValidation.availability,
    tags: generalValidation.tags,
    allowComments: generalValidation.allowComments
}).superRefine((data, ctx) => {
    if (!data.content && (!data.files || data.files.length === 0))
        return ctx.addIssue({
            code: 'custom',
            message: 'content or attachment is required',
            path: ['content', 'attachment']
        })
    if (data.tags?.length && data.tags.length != [...new Set(data.tags)].length) {
        return ctx.addIssue({
            code: 'custom',
            message: 'tags must be unique',
            path: ['tags']
        })
    }
})

export const updatePostSchema = z.object({
    content: generalValidation.content,
    availability: generalValidation.availability,
    removedAttachments: z.array(z.string()).optional(),
    newTags: generalValidation.tags,
    removedTags: generalValidation.tags,
    allowComments: generalValidation.allowComments
})

export const likeUnlikePostSchema = z.object({
    postId: z.string(),
    likeType:z.enum(['like','unlike'])
})
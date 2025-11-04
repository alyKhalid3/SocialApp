
import z from 'zod'
import { generalValidation } from '../../utils/generalValidation'





export const createCommentSchema = z.object({
    content: generalValidation.content,
    id: z.string(),
    files: generalValidation.files({ fieldname: 'attachments' }),
    tags: generalValidation.tags



}).superRefine((data, ctx) => {
    if (!data.content && (!data.files || data.files.length === 0))
        return ctx.addIssue({
            code: 'custom',
            message: 'content or attachment is required',
            path: ['content', 'attachment']
        })
    if (data.tags?.length && data.tags.length!=[...new Set(data.tags)].length){
        return ctx.addIssue({
            code: 'custom',
            message: 'tags must be unique',
            path: ['tags']
        })
    }
})


export const createReplySchema=createCommentSchema.safeExtend({
    commentId:z.string()
})


export const updateCommentSchema = z.object({
    content: generalValidation.content,
    removedAttachments: z.array(z.string()).optional(),
    newTags: generalValidation.tags,
    removedTags: generalValidation.tags,
   
})

import z from 'zod'




export const sendMessageSchema=z.object({
    content:z.string().min(1).max(500),
    sendTo:z.string()
})
export const sendGroupMessageSchema = z.object({
    content: z.string().min(1).max(500),
    groupId: z.string()
})
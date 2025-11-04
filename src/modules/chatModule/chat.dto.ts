
import { z } from 'zod'
import { sendGroupMessageSchema, sendMessageSchema } from './chat.validation'


export type sendMessageDTO=z.infer<typeof sendMessageSchema>
export type sendGroupMessageDTO=z.infer<typeof sendGroupMessageSchema>

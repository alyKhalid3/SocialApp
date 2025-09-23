import z from 'zod'
import { confirmEmailSchema, loginSchema, resendOtpSchema, signupSchema } from './auth.validation'



export type signupDTO=z.infer<typeof signupSchema>
export type confirmEmailDTO=z.infer<typeof confirmEmailSchema>
export type resendOtpDTO=z.infer<typeof resendOtpSchema>
export type loginDTO=z.infer<typeof loginSchema>
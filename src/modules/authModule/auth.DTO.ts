import z from 'zod'
import { changePasswordSchema, confirmEmailSchema, forgotPasswordSchema, loginSchema, resendOtpSchema, signupSchema } from './auth.validation'



export type signupDTO=z.infer<typeof signupSchema>
export type confirmEmailDTO=z.infer<typeof confirmEmailSchema>
export type resendOtpDTO=z.infer<typeof resendOtpSchema>
export type loginDTO=z.infer<typeof loginSchema>
export type ForgetPasswordDTO=z.infer<typeof forgotPasswordSchema>
export type ChangePasswordDTO=z.infer<typeof changePasswordSchema>
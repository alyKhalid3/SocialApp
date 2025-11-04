import z from 'zod'
import { changePasswordSchema, confirmEmailSchema, confirmUpdateEmailSchema, forgotPasswordSchema, loginSchema, resendOtpSchema, signupSchema, updateEmailSchema, updateInfoSchema, updatePasswordSchema } from './auth.validation'



export type signupDTO=z.infer<typeof signupSchema>
export type confirmEmailDTO=z.infer<typeof confirmEmailSchema>
export type resendOtpDTO=z.infer<typeof resendOtpSchema>
export type loginDTO=z.infer<typeof loginSchema>
export type ForgetPasswordDTO=z.infer<typeof forgotPasswordSchema>
export type ChangePasswordDTO=z.infer<typeof changePasswordSchema>
export type UpdatePasswordDTO=z.infer<typeof updatePasswordSchema>
export type UpdateInfoDTO=z.infer<typeof updateInfoSchema>
export type UpdateEmailDTO=z.infer<typeof updateEmailSchema>
export type ConfirmUpdatedEmailDTO=z.infer<typeof confirmUpdateEmailSchema>
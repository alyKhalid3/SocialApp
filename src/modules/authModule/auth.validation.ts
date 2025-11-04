import {z, email } from 'zod'

export const signupSchema=z.object({
    firstName:z.string().min(3).max(20),
    lastName:z.string().min(3).max(20),
    email:z.email(),
    password:z.string().min(8).max(20),
    confirmPassword:z.string(),
    phone:z.string()
}).refine(args=> args.password===args.confirmPassword,{
    path:['confirmPassword'],
    message:'passwords do not match'
})


export const confirmEmailSchema=z.object({
    otp:z.string().length(6),
    email:z.email()
})

export const resendOtpSchema=z.object({
    email:z.email()
})

export const loginSchema=z.object({
    email:z.email(),
    password:z.string().min(8).max(20)
})

export const forgotPasswordSchema=z.object({
    email:z.email()
})

export const changePasswordSchema=z.object({
    email:z.email(),
    otp:z.string().length(6),
    newPassword:z.string().min(8).max(20),
   
})


export const updatePasswordSchema=z.object({
    currentPassword:z.string().min(8).max(20),
    newPassword:z.string().min(8).max(20),
})

export const updateInfoSchema=z.object({
    firstName:z.string().min(3).max(20),
    lastName:z.string().min(3).max(20),
    phone:z.string()
})


export const updateEmailSchema=z.object({
    email:z.email(),
})

export const confirmUpdateEmailSchema=z.object({
    oldOtp:z.string().length(6),
    newOtp:z.string().length(6),
    email:z.email()
})


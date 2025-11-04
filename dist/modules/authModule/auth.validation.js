"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmUpdateEmailSchema = exports.updateEmailSchema = exports.updateInfoSchema = exports.updatePasswordSchema = exports.changePasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.resendOtpSchema = exports.confirmEmailSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
exports.signupSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(3).max(20),
    lastName: zod_1.z.string().min(3).max(20),
    email: zod_1.z.email(),
    password: zod_1.z.string().min(8).max(20),
    confirmPassword: zod_1.z.string(),
    phone: zod_1.z.string()
}).refine(args => args.password === args.confirmPassword, {
    path: ['confirmPassword'],
    message: 'passwords do not match'
});
exports.confirmEmailSchema = zod_1.z.object({
    otp: zod_1.z.string().length(6),
    email: zod_1.z.email()
});
exports.resendOtpSchema = zod_1.z.object({
    email: zod_1.z.email()
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.email(),
    password: zod_1.z.string().min(8).max(20)
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.email()
});
exports.changePasswordSchema = zod_1.z.object({
    email: zod_1.z.email(),
    otp: zod_1.z.string().length(6),
    newPassword: zod_1.z.string().min(8).max(20),
});
exports.updatePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(8).max(20),
    newPassword: zod_1.z.string().min(8).max(20),
});
exports.updateInfoSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(3).max(20),
    lastName: zod_1.z.string().min(3).max(20),
    phone: zod_1.z.string()
});
exports.updateEmailSchema = zod_1.z.object({
    email: zod_1.z.email(),
});
exports.confirmUpdateEmailSchema = zod_1.z.object({
    oldOtp: zod_1.z.string().length(6),
    newOtp: zod_1.z.string().length(6),
    email: zod_1.z.email()
});

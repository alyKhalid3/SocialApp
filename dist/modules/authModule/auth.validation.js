"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.resendOtpSchema = exports.confirmEmailSchema = exports.signupSchema = void 0;
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
    otp: zod_1.z.string(),
    email: zod_1.z.email()
});
exports.resendOtpSchema = zod_1.z.object({
    email: zod_1.z.email()
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.email(),
    password: zod_1.z.string().min(8).max(20)
});

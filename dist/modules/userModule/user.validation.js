"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmEmailSchema = exports.signupSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.signupSchema = zod_1.default.object({
    firstName: zod_1.default.string().min(3).max(20),
    lastName: zod_1.default.string().min(3).max(20),
    email: zod_1.default.email(),
    password: zod_1.default.string().min(8).max(20),
    confirmPassword: zod_1.default.string(),
    phone: zod_1.default.string()
}).refine(args => args.password === args.confirmPassword, {
    path: ['confirmPassword'],
    message: 'passwords do not match'
});
exports.confirmEmailSchema = zod_1.default.object({
    otp: zod_1.default.string(),
    email: zod_1.default.email()
});

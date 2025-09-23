"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOtp = void 0;
const nanoid_1 = __importDefault(require("nanoid"));
const createOtp = () => {
    const otp = nanoid_1.default.customAlphabet('1234567890', 6)();
    return otp;
};
exports.createOtp = createOtp;

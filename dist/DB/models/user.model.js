"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true
        // async set(value:string):Promise<string>{
        //     return await hashPassword({password:value})
        // }
    },
    emailOtp: {
        otp: { type: String },
        expireAt: { type: Date }
    },
    passwordOtp: {
        otp: { type: String },
        expireAt: { type: Date }
    },
    phone: { type: String },
    isConfirmed: {
        type: Boolean,
        default: false
    },
    isChangeCredentialsUpdated: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
exports.userModel = (0, mongoose_1.model)('user', userSchema);

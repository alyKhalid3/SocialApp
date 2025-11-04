"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = void 0;
const mongoose_1 = require("mongoose");
const hash_1 = require("../../utils/hash");
const emailEvents_1 = require("../../utils/sendEmail/emailEvents");
const generateHTML_1 = require("../../utils/sendEmail/generateHTML");
const userSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: String,
    newEmail: { type: String, required: true, unique: true },
    password: {
        type: String, required: true
    },
    emailOtp: {
        otp: { type: String },
        expireAt: { type: Date }
    },
    newEmailOtp: {
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
    isChangeCredentialsUpdated: Date,
    profileImage: String,
    coverImages: [String],
    friends: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    is2FAEnabled: { type: Boolean, default: false },
    TwoFAOtp: {
        otp: { type: String },
        expireAt: { type: Date }
    },
    blockList: [{ type: mongoose_1.Schema.Types.ObjectId }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true
});
userSchema.pre('save', async function (next) {
    this.firstCreation = this.isNew;
    this.plainTextOtp = this.emailOtp?.otp;
    if (this.isModified('password'))
        this.password = await (0, hash_1.createHash)({ text: this.password });
    if (this.isModified('emailOtp'))
        this.emailOtp.otp = await (0, hash_1.createHash)({ text: this.emailOtp.otp });
    next();
});
userSchema.post('save', async function (doc, next) {
    const that = this;
    if (that.firstCreation) {
        const subject = 'email verification';
        const html = (0, generateHTML_1.template)({ code: that.plainTextOtp, name: `${doc.firstName} ${doc.lastName}`, subject });
        emailEvents_1.emailEmitter.publish('send-email-activation-code', { to: doc.email, subject, html });
    }
    next();
});
exports.userModel = (0, mongoose_1.model)('user', userSchema);


import { HydratedDocument, model, Schema, Types } from "mongoose";
import { createHash } from "../../utils/hash";
import { promises } from "dns";
import { emailEmitter } from "../../utils/sendEmail/emailEvents";
import { template } from "../../utils/sendEmail/generateHTML";


type Otp = {
    otp: string,
    expireAt: Date
}

export interface IUser {

    firstName: string,
    lastName: string,
    email: string,
    newEmail: string,
    password: string,
    emailOtp: Otp,
    passwordOtp: Otp,
    newEmailOtp: Otp
    phone: string,
    isConfirmed: boolean,
    isChangeCredentialsUpdated: Date,
    profileImage: string,
    coverImages: String[],
    friends: [
        {
            type: Types.ObjectId,
        }
    ],
    is2FAEnabled: Boolean,
    TwoFAOtp:Otp,
    blockList:Types.ObjectId[]
}


const userSchema = new Schema<IUser>({

    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email:   String,
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
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    is2FAEnabled: {type:Boolean,default:false},
    TwoFAOtp:{
        otp:{type:String},
        expireAt:{type:Date}
    },
    blockList:[{type:Schema.Types.ObjectId}]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true
})
userSchema.pre('save', async function (this: HydratedDocument<IUser> & { firstCreation: boolean, plainTextOtp?: string }, next) {
    this.firstCreation = this.isNew
    this.plainTextOtp = this.emailOtp?.otp as string
    if (this.isModified('password'))
        this.password = await createHash({ text: this.password })
    if (this.isModified('emailOtp'))
        this.emailOtp.otp = await createHash({ text: this.emailOtp.otp })



    next()
})
userSchema.post('save', async function (doc, next) {

    const that = this as HydratedDocument<IUser> & { firstCreation: boolean, plainTextOtp?: string }
    if (that.firstCreation) {
        const subject = 'email verification'
        const html = template({ code: that.plainTextOtp as string, name: `${doc.firstName} ${doc.lastName}`, subject })
        emailEmitter.publish('send-email-activation-code', { to: doc.email, subject, html })
    }
    next()

})

export const userModel = model<IUser>('user', userSchema)


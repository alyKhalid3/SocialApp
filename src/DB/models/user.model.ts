import { model, Schema } from "mongoose";
import { createHash } from "../../utils/hash";
import { promises } from "dns";


type Otp={
    otp:string,
    expireAt:Date
}

export interface IUser{
   
    firstName:string,
    lastName:string,
    email:string,
    password:string,
    emailOtp:Otp,
    passwordOtp:Otp,
    phone:string,
    isConfirmed:boolean,
    isChangeCredentialsUpdated:Date
}


const userSchema=new Schema<IUser>({
   
    firstName:{type:String,required:true},
    lastName:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true
        // async set(value:string):Promise<string>{
        //     return await hashPassword({password:value})
        // }
    },
    emailOtp:{
        otp:{type:String},
        expireAt:{type:Date}
    },
    passwordOtp:{
        otp:{type:String},
        expireAt:{type:Date}
    },
    phone:{type:String}, 
  
    isConfirmed:{
        type:Boolean,
        default:false
    },
    isChangeCredentialsUpdated:Date
},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

export const userModel=model<IUser>('user',userSchema)


import { NextFunction, Request, Response } from "express"
import { IUser, userModel } from "../DB/models/user.model"
import { UserRepo } from "../modules/authModule/auth.repo"
import { InvalidTokenException, NotConfirmedException, NotFoundException } from "../utils/Error"
import { verifyJwt } from "../utils/jwt"
import { HydratedDocument } from "mongoose"




export enum tokenTypeEnum {access="access" ,refresh='refresh'}

export interface payload{
    jti: string,
    id: string,
    iat: number,
    exp: number
}
const UserModel=new UserRepo(userModel)
 export const decodeToken =async ({authorization,tokenType=tokenTypeEnum.access}:{authorization?: string|undefined,tokenType?: string}):Promise<{user:HydratedDocument<IUser>,payload:payload}> => {
     if(!authorization)throw new InvalidTokenException('invalid token')
     if(!authorization.startsWith(process.env.BEARER as string))throw new InvalidTokenException('invalid token')
        const token =authorization.split(' ')[1]
    if(!token)throw new InvalidTokenException('invalid token')
const payload= verifyJwt(token, 
    tokenType==tokenTypeEnum.access ? 
    process.env.ACCESS_SIGNATURE as string
    : process.env.REFRESH_SIGNATURE as string
)
   const user = await UserModel.findById({id:payload.id})
   if(!user)throw new NotFoundException('user not found')
    if(!user.isConfirmed)throw new NotConfirmedException()
   return {user,payload}
 }



 export const auth =()=>{
     return async (req:Request,res:Response,next:NextFunction):Promise<void>=>{
        
          const authorization=req.headers.authorization
          const {user,payload}=await decodeToken({authorization:authorization})
        res.locals.user=user
        res.locals.payload=payload
        next()

     }
 }
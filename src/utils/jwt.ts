import { payload } from '../middleware/auth.middleware';
import { Secret } from './../../node_modules/@types/jsonwebtoken/index.d';
import jwt, { SignOptions } from "jsonwebtoken";

export const createJwt=(payload:string|object,secret:Secret,options?:SignOptions):string=>{
    const token= jwt.sign(payload,secret,options);
    return token
}


export const verifyJwt=(token:string,secret:Secret):payload=>{
    const data=jwt.verify(token,secret);
    return data as payload
}
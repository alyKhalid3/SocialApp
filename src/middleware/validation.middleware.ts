import { NextFunction, Request, Response } from "express";
import z from "zod"
import { applicationError, ValidationError } from "../utils/Error";
import { error } from "console";

export const validation=(schema:z.ZodObject)=>{
    return (req:Request,res:Response,next:NextFunction)=>{
        const data={
            ...req.body,
            ...req.query,
            ...req.params
        }
     const result = schema.safeParse(data) 

     if(!result.success){
        const errors=result.error.issues.map((error)=>{
            return `${error.path}=>${error.message}`
        })
        throw new ValidationError(errors.join(','))
     }
     next()
}
}

import { fileTypes } from './multer/multer';
import z from "zod";
import { postAvailabilityEnum } from "../modules/postModule/post.types";

export const generalValidation={
     content: z.string().optional(),
        files: ({type=fileTypes.images,fieldname='attachments'}:{type?:string[],fieldname?:string})=>{
            return z.array(z.object({ 
            fieldname: z.enum([fieldname]),
            originalname: z.string(),
            encoding: z.string(),   
            mimetype: z.enum(type),
            size: z.number(),
            buffer:z.any().optional(),
            path: z.string().optional()
         })).optional()
        },
        availability: z.enum([
            postAvailabilityEnum.PUBLIC,
            postAvailabilityEnum.PRIVATE,
            postAvailabilityEnum.FRIENDS
        ]).default(postAvailabilityEnum.PUBLIC),
        tags: z.array(z.string()).optional(),
        allowComments: z.boolean().default(true),
}
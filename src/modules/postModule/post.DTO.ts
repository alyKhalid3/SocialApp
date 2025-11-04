import z from "zod";
import { createPostSchema, likeUnlikePostSchema, updatePostSchema } from "./post.validation";


export type createPostDTO=z.infer<typeof createPostSchema>
export type updatePostDTO=z.infer<typeof updatePostSchema>
export type likeUnlikePostDTO=z.infer<typeof likeUnlikePostSchema>
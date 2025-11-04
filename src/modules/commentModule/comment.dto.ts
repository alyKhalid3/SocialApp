import z from "zod";
import { updateCommentSchema } from "./comment.validation";




export type updateCommentDTO=z.infer<typeof updateCommentSchema>
import { NextFunction, Request, Response } from "express";
import z from "zod"
import { applicationError, ValidationError } from "../utils/Error";
import { error } from "console";
import { AuthenticatedSocket } from "../modules/gateway/gateway";

export const validation = (schema: z.ZodObject) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const data = {
            ...req.body,
            ...req.query,
            ...req.params,
            files:req.files,
            ...req.file
        }
        const result = schema.safeParse(data)

        if (!result.success) {
            const errors = result.error.issues.map((error) => {
                return `${error.path}=>${error.message}`
            })
            throw new ValidationError(errors.join(','))
        }
        next()
    }
}

export const socketValidation = (schema:z.ZodObject , handler: Function) => {
  return async (socket: AuthenticatedSocket, data: any) => {
    const result = schema.safeParse(data);
    if (!result.success) {
      const errors = result.error.issues.map(
        (err) => `${err.path.join(".")} => ${err.message}`
      );
      socket.emit("customError", {
        type: "validation",
        errors,
      });
      return; 
    }
    await handler(socket, result.data);
  };
};


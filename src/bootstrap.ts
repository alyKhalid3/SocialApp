

import { type Express } from 'express'
import express from 'express'
import path from 'path'
const app: Express = express()
import { NextFunction, Request, Response } from "express";
import dotenv from 'dotenv'
import cors from 'cors'
dotenv.config({
  path: path.resolve('./src/config/.env')
})
import baseRouter from './routes'
import { IError } from './utils/Error';
import { connectDB } from './DB/db.connection';
import { Server, Socket } from 'socket.io';
import { string } from 'zod';
import { decodeToken, tokenTypeEnum } from './middleware/auth.middleware';
import { GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { createHandler } from 'graphql-http/lib/use/express';
import { IUser } from './DB/models/user.model';
import { initialize } from './modules/gateway/gateway';


export const bootstrap = () => {
  const port = process.env.PORT
  connectDB()
  app.use(cors())
  app.get("uploads/:id", express.static(path.resolve('./src/uploads')))
  app.use(express.json())
  app.use('/api/v1', baseRouter)
  app.use((err: IError, req: Request, res: Response, next: NextFunction): Response => {
    return res.status(err.statusCode||500).json({
      errMsg: err.message,
      cause: err.statusCode||500,
      stack: err.stack
    })
  })
  const schema=new GraphQLSchema({
    query:new GraphQLObjectType({
      name:'Query',
      fields:{
        hello: {
          type: GraphQLString,
          resolve: () => 'hello world',
        },
      },
    })
  })
 app.all('/graphql',createHandler({schema}))
  
  const httpServer = app.listen(port, () => {
    console.log(`app listening on port ${port}`)
  })

  initialize(httpServer)
 
}
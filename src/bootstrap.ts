
import { type Express } from 'express'
import express from 'express'
import path from 'path'
const app: Express = express()
import { NextFunction, Request, Response } from "express";
import dotenv from 'dotenv'
dotenv.config({
  path: path.resolve('./src/config/.env')
})
import baseRouter from './routes'
import { IError } from './utils/Error';
import { connectDB } from './DB/db.connection';


export const bootstrap = () => {
  const port = process.env.PORT
  connectDB()
  app.use(express.json())
  app.use('/api/v1', baseRouter)
  app.use((err: IError, req: Request, res: Response, next: NextFunction): Response => {
    return res.status(err.statusCode||500).json({
      errMsg: err.message,
      cause: err.statusCode||500,
      stack: err.stack
    })
  })
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
}
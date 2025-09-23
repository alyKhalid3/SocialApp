import { decodeToken, payload, tokenTypeEnum } from './../../middleware/auth.middleware';
import { NextFunction, Request, Response } from "express";
import { applicationError, EmailIsExist, ExpiredOTPException, InvalidCredentialsException, NotConfirmedException } from "../../utils/Error";
import { successHandler } from '../../utils/successHandler';
import { confirmEmailDTO, loginDTO, resendOtpDTO, signupDTO } from './auth.DTO';
import { UserRepo } from './auth.repo';
import { compareHash, createHash } from "../../utils/hash";
import { createOtp } from "../../utils/sendEmail/createOtp";
import { emailEmitter } from "../../utils/sendEmail/emailEvents";
import { template } from "../../utils/sendEmail/generateHTML";
import { createJwt } from "../../utils/jwt";
import { nanoid } from "nanoid";
import 'dotenv/config'
import { IUser } from "../../DB/models/user.model";
interface IUserServices {
    signup(req: Request, res: Response): Promise<Response>
    confirmEmail(req: Request, res: Response): Promise<Response>
}

export class UserServices implements IUserServices {
    private userModel = new UserRepo()

    constructor() { }
    signup = async (req: Request, res: Response): Promise<Response> => {
        const { firstName, lastName, email, password, phone }: signupDTO = req.body
        const isExist = await this.userModel.findByEmail({ email: email })
        if (isExist)
            throw new EmailIsExist()
        const otp = createOtp()
        const subject = 'email verification'
        const html = template({ code: otp, name: `${firstName} ${lastName}`, subject })
        emailEmitter.publish('send-email-activation-code', { to: email, subject, html })
        const user = await this.userModel.create({
            data: {
                firstName,
                lastName,
                email,
                password: await createHash({ text: password }),
                phone,
                emailOtp: {
                    otp: await createHash({ text: otp }),
                    expireAt: new Date(Date.now() + (5 * 60 * 1000))
                }
            }
        })
        if (!user) {
            throw new applicationError('user not created', 400)
        }

        return successHandler({ res, data: user.toJSON() })
    }

    confirmEmail = async (req: Request, res: Response): Promise<Response> => {

        const { email, otp }: confirmEmailDTO = req.body
        const user = await this.userModel.findByEmail({ email })
        if (!user) throw new applicationError('user not found', 404)
        if (user.isConfirmed) throw new applicationError('user is already confirmed', 409)
        if (user.emailOtp.expireAt.getTime() <= Date.now()) {
            throw new ExpiredOTPException('otp is expired')
        }
        const isMatch = await compareHash({ text: otp, hash: user.emailOtp.otp })
        if (!isMatch) throw new applicationError('invalid otp', 400)
        await this.userModel.update({ filter: { email }, data: { isConfirmed: true, emailOtp: { otp: '', expireAt: new Date() } } })
        return successHandler({ res })
    }
    resendOtp = async (req: Request, res: Response): Promise<Response> => {
        const { email }: resendOtpDTO = req.body
        const user = await this.userModel.findByEmail({ email })
        if (!user) {
            throw new applicationError('user not found', 404)
        }
        if (user.isConfirmed) {
            throw new applicationError('user is already confirmed', 409)
        }
        if (user.emailOtp.expireAt.getTime() >= Date.now()) {
            throw new ExpiredOTPException('wait for 5 minutes')
        }
        const otp = createOtp()
        const subject = 'resend otp'
        const html = template({ code: otp, name: user.firstName, subject })
        emailEmitter.publish('send-email-activation-code', { to: user.email, subject, html })
        await this.userModel.update({ filter: { email }, data: { emailOtp: { otp: await createHash({ text: otp }), expireAt: new Date(Date.now() + (5 * 60 * 1000)) } } })
        return successHandler({ res })
    }
    login = async (req: Request, res: Response): Promise<Response> => {
        const { email, password }: loginDTO = req.body
        const user = await this.userModel.findByEmail({ email })
        if (!user || !await compareHash({ text: password, hash: user.password })) {
            throw new InvalidCredentialsException()
        }
        if (!user.isConfirmed) {
            throw new NotConfirmedException()
        }
        const accessToken = createJwt({
            id: user._id
        }, process.env.ACCESS_SIGNATURE as string, { jwtid: nanoid(), expiresIn: '1 H' })
        const refreshToken = createJwt({
            id: user._id
        }, process.env.REFRESH_SIGNATURE as string, { jwtid: nanoid(), expiresIn: '7 D' })

        return successHandler({ res, data: { accessToken, refreshToken } })
    }
    refreshToken = async (req: Request, res: Response): Promise<Response> => {
        const authorization = req.headers.authorization
        const { user, payload } = await decodeToken({ authorization, tokenType: tokenTypeEnum.refresh })
        const accessToken: string = createJwt({
            id: user._id
        }, process.env.ACCESS_SIGNATURE as string, { jwtid: payload.jti, expiresIn: '1h' })
        return successHandler({ res, data: { accessToken } })
    }
    getUser = async (req: Request, res: Response): Promise<Response> => {
        const user: IUser = res.locals.user
        return successHandler({ res, data: user })
    }



}



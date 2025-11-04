import { email } from 'zod';
import { userModel } from './../../DB/models/user.model';
import { decodeToken, payload, tokenTypeEnum } from './../../middleware/auth.middleware';
import { NextFunction, Request, Response } from "express";
import { applicationError, EmailIsExist, ExpiredOTPException, InvalidCredentialsException, NotConfirmedException, NotFoundException } from "../../utils/Error";
import { successHandler } from '../../utils/successHandler';
import { ChangePasswordDTO, confirmEmailDTO, ConfirmUpdatedEmailDTO, ForgetPasswordDTO, loginDTO, resendOtpDTO, signupDTO, UpdateEmailDTO, UpdateInfoDTO, UpdatePasswordDTO } from './auth.DTO';
import { UserRepo } from './auth.repo';
import { compareHash, createHash } from "../../utils/hash";
import { createOtp } from "../../utils/sendEmail/createOtp";
import { emailEmitter } from "../../utils/sendEmail/emailEvents";
import { template } from "../../utils/sendEmail/generateHTML";
import { createJwt } from "../../utils/jwt";
import { nanoid } from "nanoid";
import 'dotenv/config'
import { IUser } from "../../DB/models/user.model";
import { HydratedDocument } from 'mongoose';
interface IUserServices {
    signup(req: Request, res: Response): Promise<Response>
    login(req: Request, res: Response): Promise<Response>
    confirmEmail(req: Request, res: Response): Promise<Response>
    resendOtp(req: Request, res: Response): Promise<Response>
    forgetPassword(req: Request, res: Response): Promise<Response>
    changePassword(req: Request, res: Response): Promise<Response>
    updateInfo(req: Request, res: Response): Promise<Response>
    updatePassword(req: Request, res: Response): Promise<Response>
    refreshToken(req: Request, res: Response): Promise<Response>
    updateEmail(req: Request, res: Response): Promise<Response>

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

        const user = await this.userModel.create({
            data: {
                firstName,
                lastName,
                email,
                password,
                phone,
                emailOtp: {
                    otp,
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
        if (user.is2FAEnabled) {
            const otp = createOtp()
            const subject = 'login otp'
            const html = template({ code: otp, name: user.firstName, subject })
            emailEmitter.publish('send-email-activation-code', { to: user.email, subject, html })
            await user.updateOne({
                $set: {
                    TwoFAOtp: {
                        otp: await createHash({ text: otp }),
                        expireAt: new Date(Date.now() + (5 * 60 * 1000))
                    }
                }
            })
            return successHandler({ res, message: 'two step verification otp sent to your email' })
        }
        const accessToken = createJwt({
            id: user._id
        }, process.env.ACCESS_SIGNATURE as string, { jwtid: nanoid(), expiresIn: '1 H' })
        const refreshToken = createJwt({
            id: user._id
        }, process.env.REFRESH_SIGNATURE as string, { jwtid: nanoid(), expiresIn: '7 D' })

        return successHandler({ res, data: { accessToken, refreshToken } })
    }
    forgetPassword = async (req: Request, res: Response): Promise<Response> => {
        const { email }: ForgetPasswordDTO = req.body
        const user = await this.userModel.findByEmail({ email })
        if (!user) {
            throw new NotFoundException('user not found')
        }
        if (!user.isConfirmed) {
            throw new NotConfirmedException()
        }
        if (user.passwordOtp.expireAt.getTime() >= Date.now()) {
            throw new ExpiredOTPException('wait for 5 minutes')
        }
        const otp = createOtp()
        const subject = 'forget password'
        const html = template({ code: otp, name: user.firstName, subject })
        emailEmitter.publish('send-email-activation-code', { to: email, subject, html })
        await this.userModel.update({ filter: { email }, data: { passwordOtp: { otp: await createHash({ text: otp }), expireAt: new Date(Date.now() + (5 * 60 * 1000)) } } })
        return successHandler({ res })

    }
    changePassword = async (req: Request, res: Response): Promise<Response> => {
        const { email, otp, newPassword }: ChangePasswordDTO = req.body
        const user = await this.userModel.findByEmail({ email })
        if (!user) {
            throw new NotFoundException('user not found')
        }
        if (user.passwordOtp.expireAt.getTime() <= Date.now()) {
            throw new ExpiredOTPException('otp is expired')
        }
        const isMatch = await compareHash({ text: otp, hash: user.passwordOtp.otp })
        if (!isMatch) {
            throw new applicationError('invalid otp', 409)
        }
        await this.userModel.update({
            filter: { email }, data:
            {
                password: await createHash({ text: newPassword }),
                passwordOtp: {
                    otp: '',
                    expireAt: new Date()
                },
                isChangeCredentialsUpdated: new Date(Date.now())
            }
        })
        return successHandler({ res })

    }
    refreshToken = async (req: Request, res: Response): Promise<Response> => {
        const authorization = req.headers.authorization
        const { user, payload } = await decodeToken({ authorization, tokenType: tokenTypeEnum.refresh })
        const accessToken: string = createJwt({
            id: user._id
        }, process.env.ACCESS_SIGNATURE as string, { jwtid: payload.jti, expiresIn: '1h' })
        return successHandler({ res, data: { accessToken } })
    }
    updatePassword = async (req: Request, res: Response): Promise<Response> => {
        const { currentPassword, newPassword }: UpdatePasswordDTO = req.body
        const user = res.locals.user as HydratedDocument<IUser>
        const isMatch = await compareHash({ text: currentPassword, hash: user.password })
        if (!isMatch) {
            throw new applicationError('invalid password', 409)
        }
        if (await compareHash({ text: newPassword, hash: user.password })) {
            throw new applicationError('enter new password', 409)
        }
        user.password = newPassword
        user.isChangeCredentialsUpdated = new Date(Date.now())
        await user.save()
        return successHandler({ res })
    }
    updateInfo = async (req: Request, res: Response): Promise<Response> => {
        const { firstName, lastName, phone }: UpdateInfoDTO = req.body
        const user = res.locals.user as HydratedDocument<IUser>
        user.firstName = firstName
        user.lastName = lastName
        user.phone = phone
        await user.save()
        return successHandler({ res })
    }
    updateEmail = async (req: Request, res: Response): Promise<Response> => {
        const { email }: UpdateEmailDTO = req.body
        const user = res.locals.user
        if (user.email === email) {
            throw new applicationError('email is same', 409)
        }
        const isExist = await this.userModel.findByEmail({ email })
        if (isExist) {
            throw new EmailIsExist()
        }
        user.isConfirmed = false


        const oldOtp = createOtp()
        user.emailOtp = {
            otp: oldOtp,
            expireAt: new Date(Date.now() + (5 * 60 * 1000))
        }
        emailEmitter.publish('send-email-activation-code', { to: user.email, subject: 'update email', html: template({ code: oldOtp, name: user.firstName, subject: 'update email' }) })

        const newOtp = createOtp()
        user.newEmailOtp = {
            otp: await createHash({ text: newOtp }),
            expireAt: new Date(Date.now() + (5 * 60 * 1000))
        }
        emailEmitter.publish('send-email-activation-code', { to: email, subject: 'confirm updated email', html: template({ code: newOtp, name: user.firstName, subject: 'confirm updated email' }) })
        user.isConfirmed = false
        user.newEmail = email
        await user.save()

        return successHandler({ res })
    }
    confirmUpdatedEmail = async (req: Request, res: Response): Promise<Response> => {
        const { email, oldOtp, newOtp }: ConfirmUpdatedEmailDTO = req.body
        const user = await this.userModel.findByEmail({ email })
        if (!user)
            throw new NotFoundException('user not found')
        if (user.emailOtp.expireAt.getTime() <= Date.now() || user.newEmailOtp.expireAt.getTime() <= Date.now())
            throw new ExpiredOTPException('otp is expired')
        if (! await compareHash({ text: oldOtp, hash: user.emailOtp.otp }) || !compareHash({ text: newOtp, hash: user.newEmailOtp.otp }))
            throw new applicationError('invalid otp', 409)

        await user.updateOne({
            $set: {
                isConfirmed: true,
                email: user.newEmail,
                isChangeCredentialsUpdated: new Date(Date.now())
            },
            $unset: {
                newEmailOtp: {},
                emailOtp: {},
                newEmail: {}
            }

        })


        return successHandler({ res })
    }

    enable2FA = async (req: Request, res: Response): Promise<Response> => {
        const user = res.locals.user
        if (!user.isConfirmed) {
            throw new NotConfirmedException()
        }
        const otp = createOtp()
        emailEmitter.publish('enable-two-step-verification', { to: user.email, subject: 'enable two step verification', html: template({ code: otp, name: user.firstName, subject: 'enable two step verification' }) })

        user.TwoFAOtp = {
            otp: await createHash({ text: otp }),
            expireAt: new Date(Date.now() + (5 * 60 * 1000))
        }
        await user.save()
        return successHandler({ res })
    }
    activate2FA = async (req: Request, res: Response): Promise<Response> => {
        const { otp } = req.body
        const user = res.locals.user
        if (!user.TwoFAOtp || !user.TwoFAOtp.expireAt)
            throw new applicationError('No OTP found', 400)
        if (user.TwoFAOtp.expireAt?.getTime() <= Date.now())
            throw new ExpiredOTPException('otp is expired')
        if (! await compareHash({ text: otp, hash: user.TwoFAOtp.otp }))
            throw new applicationError('invalid otp', 409)
        await user.updateOne({
            $unset: { TwoFAOtp: {} },
            $set: { is2FAEnabled: true }
        })

        return successHandler({ res })
    }
    loginWith2FA = async (req: Request, res: Response): Promise<Response> => {
        const { otp, email } = req.body
        const user = await this.userModel.findByEmail({ email })
        if(!user){
            throw new NotFoundException('user not found')
        }
        if (!user.TwoFAOtp || !user.TwoFAOtp.expireAt)
            throw new applicationError('No OTP found', 400)
        if (user.TwoFAOtp.expireAt?.getTime() <= Date.now())
            throw new ExpiredOTPException('otp is expired')
        if (!await compareHash({ text: otp, hash: user.TwoFAOtp.otp }))
            throw new applicationError('invalid otp', 409)
        await user.updateOne({
            $unset: { TwoFAOtp: "" }
        })
        const accessToken = createJwt({
            id: user._id
        }, process.env.ACCESS_SIGNATURE as string, { jwtid: nanoid(), expiresIn: '1 H' })
        const refreshToken = createJwt({
            id: user._id
        }, process.env.REFRESH_SIGNATURE as string, { jwtid: nanoid(), expiresIn: '7 D' })
        return successHandler({ res, data: { accessToken, refreshToken } })
    }




}



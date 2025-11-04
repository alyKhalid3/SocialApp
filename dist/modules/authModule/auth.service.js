"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
const auth_middleware_1 = require("./../../middleware/auth.middleware");
const Error_1 = require("../../utils/Error");
const successHandler_1 = require("../../utils/successHandler");
const auth_repo_1 = require("./auth.repo");
const hash_1 = require("../../utils/hash");
const createOtp_1 = require("../../utils/sendEmail/createOtp");
const emailEvents_1 = require("../../utils/sendEmail/emailEvents");
const generateHTML_1 = require("../../utils/sendEmail/generateHTML");
const jwt_1 = require("../../utils/jwt");
const nanoid_1 = require("nanoid");
require("dotenv/config");
class UserServices {
    userModel = new auth_repo_1.UserRepo();
    constructor() { }
    signup = async (req, res) => {
        const { firstName, lastName, email, password, phone } = req.body;
        const isExist = await this.userModel.findByEmail({ email: email });
        if (isExist)
            throw new Error_1.EmailIsExist();
        const otp = (0, createOtp_1.createOtp)();
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
        });
        if (!user) {
            throw new Error_1.applicationError('user not created', 400);
        }
        return (0, successHandler_1.successHandler)({ res, data: user.toJSON() });
    };
    confirmEmail = async (req, res) => {
        const { email, otp } = req.body;
        const user = await this.userModel.findByEmail({ email });
        if (!user)
            throw new Error_1.applicationError('user not found', 404);
        if (user.isConfirmed)
            throw new Error_1.applicationError('user is already confirmed', 409);
        if (user.emailOtp.expireAt.getTime() <= Date.now()) {
            throw new Error_1.ExpiredOTPException('otp is expired');
        }
        const isMatch = await (0, hash_1.compareHash)({ text: otp, hash: user.emailOtp.otp });
        if (!isMatch)
            throw new Error_1.applicationError('invalid otp', 400);
        await this.userModel.update({ filter: { email }, data: { isConfirmed: true, emailOtp: { otp: '', expireAt: new Date() } } });
        return (0, successHandler_1.successHandler)({ res });
    };
    resendOtp = async (req, res) => {
        const { email } = req.body;
        const user = await this.userModel.findByEmail({ email });
        if (!user) {
            throw new Error_1.applicationError('user not found', 404);
        }
        if (user.isConfirmed) {
            throw new Error_1.applicationError('user is already confirmed', 409);
        }
        if (user.emailOtp.expireAt.getTime() >= Date.now()) {
            throw new Error_1.ExpiredOTPException('wait for 5 minutes');
        }
        const otp = (0, createOtp_1.createOtp)();
        const subject = 'resend otp';
        const html = (0, generateHTML_1.template)({ code: otp, name: user.firstName, subject });
        emailEvents_1.emailEmitter.publish('send-email-activation-code', { to: user.email, subject, html });
        await this.userModel.update({ filter: { email }, data: { emailOtp: { otp: await (0, hash_1.createHash)({ text: otp }), expireAt: new Date(Date.now() + (5 * 60 * 1000)) } } });
        return (0, successHandler_1.successHandler)({ res });
    };
    login = async (req, res) => {
        const { email, password } = req.body;
        const user = await this.userModel.findByEmail({ email });
        if (!user || !await (0, hash_1.compareHash)({ text: password, hash: user.password })) {
            throw new Error_1.InvalidCredentialsException();
        }
        if (!user.isConfirmed) {
            throw new Error_1.NotConfirmedException();
        }
        if (user.is2FAEnabled) {
            const otp = (0, createOtp_1.createOtp)();
            const subject = 'login otp';
            const html = (0, generateHTML_1.template)({ code: otp, name: user.firstName, subject });
            emailEvents_1.emailEmitter.publish('send-email-activation-code', { to: user.email, subject, html });
            await user.updateOne({
                $set: {
                    TwoFAOtp: {
                        otp: await (0, hash_1.createHash)({ text: otp }),
                        expireAt: new Date(Date.now() + (5 * 60 * 1000))
                    }
                }
            });
            return (0, successHandler_1.successHandler)({ res, message: 'two step verification otp sent to your email' });
        }
        const accessToken = (0, jwt_1.createJwt)({
            id: user._id
        }, process.env.ACCESS_SIGNATURE, { jwtid: (0, nanoid_1.nanoid)(), expiresIn: '1 H' });
        const refreshToken = (0, jwt_1.createJwt)({
            id: user._id
        }, process.env.REFRESH_SIGNATURE, { jwtid: (0, nanoid_1.nanoid)(), expiresIn: '7 D' });
        return (0, successHandler_1.successHandler)({ res, data: { accessToken, refreshToken } });
    };
    forgetPassword = async (req, res) => {
        const { email } = req.body;
        const user = await this.userModel.findByEmail({ email });
        if (!user) {
            throw new Error_1.NotFoundException('user not found');
        }
        if (!user.isConfirmed) {
            throw new Error_1.NotConfirmedException();
        }
        if (user.passwordOtp.expireAt.getTime() >= Date.now()) {
            throw new Error_1.ExpiredOTPException('wait for 5 minutes');
        }
        const otp = (0, createOtp_1.createOtp)();
        const subject = 'forget password';
        const html = (0, generateHTML_1.template)({ code: otp, name: user.firstName, subject });
        emailEvents_1.emailEmitter.publish('send-email-activation-code', { to: email, subject, html });
        await this.userModel.update({ filter: { email }, data: { passwordOtp: { otp: await (0, hash_1.createHash)({ text: otp }), expireAt: new Date(Date.now() + (5 * 60 * 1000)) } } });
        return (0, successHandler_1.successHandler)({ res });
    };
    changePassword = async (req, res) => {
        const { email, otp, newPassword } = req.body;
        const user = await this.userModel.findByEmail({ email });
        if (!user) {
            throw new Error_1.NotFoundException('user not found');
        }
        if (user.passwordOtp.expireAt.getTime() <= Date.now()) {
            throw new Error_1.ExpiredOTPException('otp is expired');
        }
        const isMatch = await (0, hash_1.compareHash)({ text: otp, hash: user.passwordOtp.otp });
        if (!isMatch) {
            throw new Error_1.applicationError('invalid otp', 409);
        }
        await this.userModel.update({
            filter: { email }, data: {
                password: await (0, hash_1.createHash)({ text: newPassword }),
                passwordOtp: {
                    otp: '',
                    expireAt: new Date()
                },
                isChangeCredentialsUpdated: new Date(Date.now())
            }
        });
        return (0, successHandler_1.successHandler)({ res });
    };
    refreshToken = async (req, res) => {
        const authorization = req.headers.authorization;
        const { user, payload } = await (0, auth_middleware_1.decodeToken)({ authorization, tokenType: auth_middleware_1.tokenTypeEnum.refresh });
        const accessToken = (0, jwt_1.createJwt)({
            id: user._id
        }, process.env.ACCESS_SIGNATURE, { jwtid: payload.jti, expiresIn: '1h' });
        return (0, successHandler_1.successHandler)({ res, data: { accessToken } });
    };
    updatePassword = async (req, res) => {
        const { currentPassword, newPassword } = req.body;
        const user = res.locals.user;
        const isMatch = await (0, hash_1.compareHash)({ text: currentPassword, hash: user.password });
        if (!isMatch) {
            throw new Error_1.applicationError('invalid password', 409);
        }
        if (await (0, hash_1.compareHash)({ text: newPassword, hash: user.password })) {
            throw new Error_1.applicationError('enter new password', 409);
        }
        user.password = newPassword;
        user.isChangeCredentialsUpdated = new Date(Date.now());
        await user.save();
        return (0, successHandler_1.successHandler)({ res });
    };
    updateInfo = async (req, res) => {
        const { firstName, lastName, phone } = req.body;
        const user = res.locals.user;
        user.firstName = firstName;
        user.lastName = lastName;
        user.phone = phone;
        await user.save();
        return (0, successHandler_1.successHandler)({ res });
    };
    updateEmail = async (req, res) => {
        const { email } = req.body;
        const user = res.locals.user;
        if (user.email === email) {
            throw new Error_1.applicationError('email is same', 409);
        }
        const isExist = await this.userModel.findByEmail({ email });
        if (isExist) {
            throw new Error_1.EmailIsExist();
        }
        user.isConfirmed = false;
        const oldOtp = (0, createOtp_1.createOtp)();
        user.emailOtp = {
            otp: oldOtp,
            expireAt: new Date(Date.now() + (5 * 60 * 1000))
        };
        emailEvents_1.emailEmitter.publish('send-email-activation-code', { to: user.email, subject: 'update email', html: (0, generateHTML_1.template)({ code: oldOtp, name: user.firstName, subject: 'update email' }) });
        const newOtp = (0, createOtp_1.createOtp)();
        user.newEmailOtp = {
            otp: await (0, hash_1.createHash)({ text: newOtp }),
            expireAt: new Date(Date.now() + (5 * 60 * 1000))
        };
        emailEvents_1.emailEmitter.publish('send-email-activation-code', { to: email, subject: 'confirm updated email', html: (0, generateHTML_1.template)({ code: newOtp, name: user.firstName, subject: 'confirm updated email' }) });
        user.isConfirmed = false;
        user.newEmail = email;
        await user.save();
        return (0, successHandler_1.successHandler)({ res });
    };
    confirmUpdatedEmail = async (req, res) => {
        const { email, oldOtp, newOtp } = req.body;
        const user = await this.userModel.findByEmail({ email });
        if (!user)
            throw new Error_1.NotFoundException('user not found');
        if (user.emailOtp.expireAt.getTime() <= Date.now() || user.newEmailOtp.expireAt.getTime() <= Date.now())
            throw new Error_1.ExpiredOTPException('otp is expired');
        if (!await (0, hash_1.compareHash)({ text: oldOtp, hash: user.emailOtp.otp }) || !(0, hash_1.compareHash)({ text: newOtp, hash: user.newEmailOtp.otp }))
            throw new Error_1.applicationError('invalid otp', 409);
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
        });
        return (0, successHandler_1.successHandler)({ res });
    };
    enable2FA = async (req, res) => {
        const user = res.locals.user;
        if (!user.isConfirmed) {
            throw new Error_1.NotConfirmedException();
        }
        const otp = (0, createOtp_1.createOtp)();
        emailEvents_1.emailEmitter.publish('enable-two-step-verification', { to: user.email, subject: 'enable two step verification', html: (0, generateHTML_1.template)({ code: otp, name: user.firstName, subject: 'enable two step verification' }) });
        user.TwoFAOtp = {
            otp: await (0, hash_1.createHash)({ text: otp }),
            expireAt: new Date(Date.now() + (5 * 60 * 1000))
        };
        await user.save();
        return (0, successHandler_1.successHandler)({ res });
    };
    activate2FA = async (req, res) => {
        const { otp } = req.body;
        const user = res.locals.user;
        if (!user.TwoFAOtp || !user.TwoFAOtp.expireAt)
            throw new Error_1.applicationError('No OTP found', 400);
        if (user.TwoFAOtp.expireAt?.getTime() <= Date.now())
            throw new Error_1.ExpiredOTPException('otp is expired');
        if (!await (0, hash_1.compareHash)({ text: otp, hash: user.TwoFAOtp.otp }))
            throw new Error_1.applicationError('invalid otp', 409);
        await user.updateOne({
            $unset: { TwoFAOtp: {} },
            $set: { is2FAEnabled: true }
        });
        return (0, successHandler_1.successHandler)({ res });
    };
    loginWith2FA = async (req, res) => {
        const { otp, email } = req.body;
        const user = await this.userModel.findByEmail({ email });
        if (!user) {
            throw new Error_1.NotFoundException('user not found');
        }
        if (!user.TwoFAOtp || !user.TwoFAOtp.expireAt)
            throw new Error_1.applicationError('No OTP found', 400);
        if (user.TwoFAOtp.expireAt?.getTime() <= Date.now())
            throw new Error_1.ExpiredOTPException('otp is expired');
        if (!await (0, hash_1.compareHash)({ text: otp, hash: user.TwoFAOtp.otp }))
            throw new Error_1.applicationError('invalid otp', 409);
        await user.updateOne({
            $unset: { TwoFAOtp: "" }
        });
        const accessToken = (0, jwt_1.createJwt)({
            id: user._id
        }, process.env.ACCESS_SIGNATURE, { jwtid: (0, nanoid_1.nanoid)(), expiresIn: '1 H' });
        const refreshToken = (0, jwt_1.createJwt)({
            id: user._id
        }, process.env.REFRESH_SIGNATURE, { jwtid: (0, nanoid_1.nanoid)(), expiresIn: '7 D' });
        return (0, successHandler_1.successHandler)({ res, data: { accessToken, refreshToken } });
    };
}
exports.UserServices = UserServices;

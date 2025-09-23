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
        const subject = 'email verification';
        const html = (0, generateHTML_1.template)({ code: otp, name: `${firstName} ${lastName}`, subject });
        emailEvents_1.emailEmitter.publish('send-email-activation-code', { to: email, subject, html });
        const user = await this.userModel.create({
            data: {
                firstName,
                lastName,
                email,
                password: await (0, hash_1.createHash)({ text: password }),
                phone,
                emailOtp: {
                    otp: await (0, hash_1.createHash)({ text: otp }),
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
        const accessToken = (0, jwt_1.createJwt)({
            id: user._id
        }, process.env.ACCESS_SIGNATURE, { jwtid: (0, nanoid_1.nanoid)(), expiresIn: '1 H' });
        const refreshToken = (0, jwt_1.createJwt)({
            id: user._id
        }, process.env.REFRESH_SIGNATURE, { jwtid: (0, nanoid_1.nanoid)(), expiresIn: '7 D' });
        return (0, successHandler_1.successHandler)({ res, data: { accessToken, refreshToken } });
    };
    refreshToken = async (req, res) => {
        const authorization = req.headers.authorization;
        const { user, payload } = await (0, auth_middleware_1.decodeToken)({ authorization, tokenType: auth_middleware_1.tokenTypeEnum.refresh });
        const accessToken = (0, jwt_1.createJwt)({
            id: user._id
        }, process.env.ACCESS_SIGNATURE, { jwtid: payload.jti, expiresIn: '1h' });
        return (0, successHandler_1.successHandler)({ res, data: { accessToken } });
    };
    getUser = async (req, res) => {
        const user = res.locals.user;
        return (0, successHandler_1.successHandler)({ res, data: user });
    };
}
exports.UserServices = UserServices;

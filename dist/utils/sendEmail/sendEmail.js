"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
require("dotenv/config");
const sendEmail = async ({ to, subject, html }) => {
    const trasporter = nodemailer_1.default.createTransport({
        host: process.env.HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });
    const main = async () => {
        const info = await trasporter.sendMail({
            from: `socia App <${process.env.USERNAME}>`,
            to: to,
            subject: subject,
            html: html
        });
    };
    main().catch(console.error);
};
exports.sendEmail = sendEmail;

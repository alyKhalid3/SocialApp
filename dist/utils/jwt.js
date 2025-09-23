"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwt = exports.createJwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createJwt = (payload, secret, options) => {
    const token = jsonwebtoken_1.default.sign(payload, secret, options);
    return token;
};
exports.createJwt = createJwt;
const verifyJwt = (token, secret) => {
    const data = jsonwebtoken_1.default.verify(token, secret);
    return data;
};
exports.verifyJwt = verifyJwt;

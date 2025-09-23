"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareHash = exports.createHash = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
require("dotenv/config");
const createHash = async ({ text }) => {
    const data = await bcrypt_1.default.hash(text, Number(process.env.SALT));
    return data;
};
exports.createHash = createHash;
const compareHash = async ({ text, hash }) => {
    const data = await bcrypt_1.default.compare(text, hash);
    return data;
};
exports.compareHash = compareHash;

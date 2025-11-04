"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = exports.authRouter = void 0;
var auth_controller_1 = require("./auth.controller");
Object.defineProperty(exports, "authRouter", { enumerable: true, get: function () { return __importDefault(auth_controller_1).default; } });
Object.defineProperty(exports, "authRoutes", { enumerable: true, get: function () { return auth_controller_1.authRoutes; } });

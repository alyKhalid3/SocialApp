"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = exports.userRouter = void 0;
var user_controller_1 = require("./user.controller");
Object.defineProperty(exports, "userRouter", { enumerable: true, get: function () { return __importDefault(user_controller_1).default; } });
Object.defineProperty(exports, "userRoutes", { enumerable: true, get: function () { return user_controller_1.userRoutes; } });

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const auth_service_1 = require("./auth.service");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const authValidation = __importStar(require("./auth.validation"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
exports.authRoutes = {
    base: "/auth",
    signup: "/signup",
    confirmEmail: "/confirm-email",
    resendOtp: "/resend-otp",
    login: "/login",
    forgetPassword: "/forget-password",
    changePassword: "/change-password",
    updatePassword: "/update-password",
    refreshToken: "/refresh-token",
    updateInfo: '/update-info',
    updateEmail: "/update-email",
    confirmUpdateEmail: "/confirm-update-email",
    enable2FA: "/enable-2fa",
    activate2FA: "/activate-2fa",
    loginWith2FA: "/login-with-2fa",
    getUser: "/me"
};
const router = (0, express_1.Router)();
const userServices = new auth_service_1.UserServices();
router.post(exports.authRoutes.signup, (0, validation_middleware_1.validation)(authValidation.signupSchema), userServices.signup);
router.patch(exports.authRoutes.confirmEmail, (0, validation_middleware_1.validation)(authValidation.confirmEmailSchema), userServices.confirmEmail);
router.patch(exports.authRoutes.resendOtp, (0, validation_middleware_1.validation)(authValidation.resendOtpSchema), userServices.resendOtp);
router.post(exports.authRoutes.login, (0, validation_middleware_1.validation)(authValidation.loginSchema), userServices.login);
router.patch(exports.authRoutes.forgetPassword, (0, validation_middleware_1.validation)(authValidation.forgotPasswordSchema), userServices.forgetPassword);
router.patch(exports.authRoutes.changePassword, (0, validation_middleware_1.validation)(authValidation.changePasswordSchema), userServices.changePassword);
router.patch(exports.authRoutes.updatePassword, (0, auth_middleware_1.auth)(), (0, validation_middleware_1.validation)(authValidation.updatePasswordSchema), userServices.updatePassword);
router.patch(exports.authRoutes.updateEmail, (0, auth_middleware_1.auth)(), (0, validation_middleware_1.validation)(authValidation.updateEmailSchema), userServices.updateEmail);
router.patch(exports.authRoutes.confirmUpdateEmail, (0, validation_middleware_1.validation)(authValidation.confirmUpdateEmailSchema), userServices.confirmUpdatedEmail);
router.patch(exports.authRoutes.enable2FA, (0, auth_middleware_1.auth)(), userServices.enable2FA);
router.patch(exports.authRoutes.activate2FA, (0, auth_middleware_1.auth)(), userServices.activate2FA);
router.post(exports.authRoutes.loginWith2FA, userServices.loginWith2FA);
router.patch(exports.authRoutes.updateInfo, (0, auth_middleware_1.auth)(), (0, validation_middleware_1.validation)(authValidation.updateInfoSchema), userServices.updateInfo);
router.post('/refresh-token', userServices.refreshToken);
// router.get('/me',auth(),userServices.getUser)
exports.default = router;

import { Router } from "express";
import { UserServices } from "./auth.service";
import { validation } from "../../middleware/validation.middleware";
import * as authValidation from "./auth.validation";
import { auth } from "../../middleware/auth.middleware";
export const authRoutes={
    base:"/auth",
    signup:"/signup",
    confirmEmail:"/confirm-email",
    resendOtp:"/resend-otp",
    login:"/login",
    forgetPassword:"/forget-password",
    changePassword:"/change-password",
    updatePassword:"/update-password",
    refreshToken:"/refresh-token",
    updateInfo:'/update-info',
    updateEmail:"/update-email",
    confirmUpdateEmail:"/confirm-update-email",
    enable2FA:"/enable-2fa",
    activate2FA:"/activate-2fa",
    loginWith2FA:"/login-with-2fa",
    getUser:"/me"
}
const router= Router();
const userServices=new UserServices()
router.post(authRoutes.signup,validation(authValidation.signupSchema),userServices.signup)
router.patch(authRoutes.confirmEmail,validation(authValidation.confirmEmailSchema),userServices.confirmEmail)
router.patch(authRoutes.resendOtp,validation(authValidation.resendOtpSchema),userServices.resendOtp)
router.post(authRoutes.login,validation(authValidation.loginSchema),userServices.login)
router.patch(authRoutes.forgetPassword,validation(authValidation.forgotPasswordSchema),userServices.forgetPassword)
router.patch(authRoutes.changePassword,validation(authValidation.changePasswordSchema),userServices.changePassword)
router.patch(authRoutes.updatePassword,auth(),validation(authValidation.updatePasswordSchema),userServices.updatePassword)
router.patch(authRoutes.updateEmail,auth(),validation(authValidation.updateEmailSchema),userServices.updateEmail)
router.patch(authRoutes.confirmUpdateEmail,validation(authValidation.confirmUpdateEmailSchema),userServices.confirmUpdatedEmail)
router.patch(authRoutes.enable2FA,auth(),userServices.enable2FA)
router.patch(authRoutes.activate2FA,auth(),userServices.activate2FA)
router.post(authRoutes.loginWith2FA,userServices.loginWith2FA)
router.patch(authRoutes.updateInfo,auth(),validation(authValidation.updateInfoSchema),userServices.updateInfo)
router.post('/refresh-token',userServices.refreshToken)
// router.get('/me',auth(),userServices.getUser)

export default router   
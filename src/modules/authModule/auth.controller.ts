import { Router } from "express";
import { UserServices } from "./auth.service";
import { validation } from "../../middleware/validation.middleware";
import * as authValidation from "./auth.validation";
import { auth } from "../../middleware/auth.middleware";

const router= Router();
const userServices=new UserServices()
router.post('/signup',validation(authValidation.signupSchema),userServices.signup)
router.patch('/confirm-email',validation(authValidation.confirmEmailSchema),userServices.confirmEmail)
router.patch('/resend-otp',validation(authValidation.resendOtpSchema),userServices.resendOtp)
router.post('/login',validation(authValidation.loginSchema),userServices.login)
router.patch('/forget-password',validation(authValidation.forgotPasswordSchema),userServices.forgetPassword)
router.patch('/change-password',validation(authValidation.changePasswordSchema),userServices.changePassword)
router.post('/refresh-token',userServices.refreshToken)
router.get('/me',auth(),userServices.getUser)

export default router   
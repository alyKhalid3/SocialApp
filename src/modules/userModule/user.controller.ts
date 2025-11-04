import { Router } from "express";
import { auth } from "../../middleware/auth.middleware";
import { uploadFile } from "../../utils/multer/multer";
import { UserServices } from "./user.service";
import { chatRouter } from "../chatModule";

const router = Router()
const userServices = new UserServices()
router.use("/:userId/chat",chatRouter)
export const userRoutes = {
    base: '/user',
    profileImage: '/profile-image',
    coverImages: '/cover-images',
    deleteSingleFile: '/delete-file',
    sendFriendRequest: '/send-friend-request',
    acceptFriendReq: '/accept-friend-request/:id',
    deleteFriendReq: '/delete-friend-request/:id',
    unfriend: '/unfriend/:id',
    block: '/block/:id',
    unblock: '/unblock/:id',
    profile:'/profile'
}
router.post(userRoutes.profileImage, auth(), uploadFile({}).single('image'), userServices.profileImage)
router.post(userRoutes.coverImages, auth(), uploadFile({}).array('images'), userServices.coverImages)
router.delete(userRoutes.deleteSingleFile, auth(), userServices.deleteSingleFile)
router.post(userRoutes.sendFriendRequest, auth(), userServices.sendFriendRequest)
router.patch(userRoutes.acceptFriendReq, auth(), userServices.acceptFriendReq)
router.patch(userRoutes.deleteFriendReq, auth(), userServices.deleteFriendReq)
router.patch(userRoutes.unfriend, auth(), userServices.unfriend)
router.patch(userRoutes.block, auth(), userServices.blockUser)
router.patch(userRoutes.unblock, auth(), userServices.unblockUser)
router.get(userRoutes.profile, auth(), userServices.profile)

export default router
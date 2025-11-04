import { Router } from "express";
import { ChatServices } from "./chat.rest.service";
import { auth } from "../../middleware/auth.middleware";


const router=Router({
    mergeParams:true
})
export const chatRoutes={
    base:'/chat',
    getChat:"/",
    createGroupChat:"/create-group",
    getGroupChat:"/get-group-chat/:groupId"
}
const chatServices=new ChatServices()
router.get(chatRoutes.getChat,auth(),chatServices.getChat)

router.post(chatRoutes.createGroupChat,auth(),chatServices.createGroupChat)

router.get(chatRoutes.getGroupChat,auth(),chatServices.getGroupChat)

export default router
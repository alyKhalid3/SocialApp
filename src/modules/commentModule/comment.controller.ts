import { Router } from "express";
import { auth } from "../../middleware/auth.middleware";
import { CommentServices } from "./comment.service";
import { uploadFile } from "../../utils/multer/multer";
import { validation } from "../../middleware/validation.middleware";
import * as validator from "./comment.validation";
const router = Router({
    mergeParams: true
})
export const commentRoutes={
    base:"/comment",
    createComment:"/",
    updateComment:"/update/:id",
    createReply:"/:commentId/reply",
    softDelete:"/soft-delete/:id",
    hardDelete:"/hard-delete/:id"
}
const commentServices = new CommentServices()

router.post(commentRoutes.createComment,auth(),uploadFile({}).array('attachments', 4),validation(validator.createCommentSchema),commentServices.createComment)
router.post(commentRoutes.createReply,auth(),uploadFile({}).array('attachments', 4),validation(validator.createReplySchema),commentServices.createReply)

router.patch(commentRoutes.updateComment,auth(),uploadFile({}).array('newAttachments', 4),validation(validator.updateCommentSchema),commentServices.updateComment)

router.get('/:commentId',commentServices.getComment)
router.get('/comment-reply/:commentId',commentServices.getCommentWithReply)


router.patch(commentRoutes.softDelete,auth(),commentServices.softDelete)
router.delete(commentRoutes.hardDelete,auth(),commentServices.hardDelete)



export default router
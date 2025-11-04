import { Router } from "express";
import { auth } from "../../middleware/auth.middleware";
import { PostServices } from "./post.service";
import { fileTypes, uploadFile } from "../../utils/multer/multer";
import { validation } from "../../middleware/validation.middleware";
import * as PostValidation from "./post.validation";
import { commentRouter } from "../commentModule";

const router = Router()
router.use('/:id/comment',commentRouter)
const postServices = new PostServices()
export const postRoutes = {
    base:'/post',
    createPost: '/',
    likePost:'/like-unlike',
    updatePost:'/update-post/:id',
    getPost:'/:id',
    softDelete:'/soft-delete/:id',
    hardDelete:'/hard-delete/:id'
}

router.post(
    postRoutes.createPost, auth(),
    uploadFile({}).array('attachments', 4),
    validation(PostValidation.createPostSchema),
    postServices.createPost
)

router.patch(postRoutes.likePost,
     auth(),
     validation(PostValidation.likeUnlikePostSchema),
      postServices.like_unlikePost
    )
router.patch(postRoutes.updatePost,
     auth(),  
     uploadFile({}).array('newAttachments', 4), 
     validation(PostValidation.updatePostSchema),
      postServices.updatePost
    )

router.get(postRoutes.getPost, auth(), postServices.getPostById)

router.patch(postRoutes.softDelete, auth(), postServices.softDelete)
router.delete(postRoutes.hardDelete, auth(), postServices.hardDelete)
export default router
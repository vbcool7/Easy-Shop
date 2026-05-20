
import express from 'express';
import authMiddleware from '../Middlewares/authMiddleware.js';
import { upload } from '../Middlewares/imageStorage.js';
import {
    createBlog,
    updateBlog,
    vendorBlogList,
    toggleBlogVisibility,
    blogList,
    getBlogById,
    getRelatedBlogs
} from '../Controllers/blogController.js';

const router = express.Router();

router.get('/get-blogs', blogList);
router.get('/get-blog/:blog_id', getBlogById);
router.get('/get-related-blogs/:blog_id', getRelatedBlogs);

router.get('/get-vendor-blogs', authMiddleware(['admin', 'vendor']), vendorBlogList);
router.post('/create-blog', authMiddleware(['admin', 'vendor']), upload.single('bannerImage'), createBlog);
router.put('/update-blog/:blog_id', authMiddleware(['admin', 'vendor']), upload.single('bannerImage'), updateBlog);
router.patch('/toggle-visibility/:blog_id', authMiddleware(['vendor']), toggleBlogVisibility);

export default router;
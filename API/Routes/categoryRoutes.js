
import express from 'express';
import { upload } from '../Middlewares/imageStorage.js';
import authMiddleware from '../Middlewares/authMiddleware.js';
import {
    addCategory,
    listCategory,
    updateCategory,
    deleteCategory,
    getCategoryDeleteInfo,
    getCategory,
    toggleCategoryStatus,
    getCategoryTree
} from '../Controllers/categoryController.js';

const router = express.Router();

router.get('/category-list', listCategory);
router.get('/category-get/:cat_id', getCategory);
router.get('/category-tree-get', getCategoryTree);

router.post('/category-add', authMiddleware(['admin']), upload.single('catImage'), addCategory);
router.put('/category-update/:cat_id', authMiddleware(['admin']), upload.single('catImage'), updateCategory);
router.get('/category-delete-info/:cat_id', authMiddleware(['admin']), getCategoryDeleteInfo);
router.delete('/category-delete/:cat_id', authMiddleware(['admin']), deleteCategory);
router.patch('/category-toggle-status/:cat_id', authMiddleware(['admin']), toggleCategoryStatus);

export default router;
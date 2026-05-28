
import express from 'express';
import authMiddleware from '../Middlewares/authMiddleware.js';
import { upload } from '../Middlewares/imageStorage.js';
import {
    addProduct,
    allProductList,
    getVendorProducts,
    updateProduct,
    getMyCategories,
    getSubCategoriesByCategories,
    deleteProduct,
    getProductDeleteInfo,
    toggleProductActive,
    detailProduct,
    detailProductPublic,
    countProducts,
    getFilteredProducts,
    getInventoryStats,
    getTopSellingProducts,
    getStockAlerts,
    getProductFilterOptions,
    getSimilarProducts,
    getVendorShopProducts,
    getSearchSuggestions
} from '../Controllers/productController.js';

const router = express.Router();

router.get('/product-list-all', allProductList);
router.get('/product-detail-public/:prod_id', detailProductPublic);
router.get('/product-filter', getFilteredProducts);
router.get('/filter-options/:catId', getProductFilterOptions);
router.get('/get-similar-products/:prod_id', getSimilarProducts);
router.get('/get-vendor-shop-products/:vendor_id', getVendorShopProducts);
router.get('/get-search-suggestions', getSearchSuggestions);

router.post(
    '/product-add/:subCat_id',
    authMiddleware(['vendor', 'admin']),
    upload.any(), // accepts any field name
    addProduct);

router.put(
    '/product-update/:prod_id',
    authMiddleware(['vendor', 'admin']),
    upload.any(),
    updateProduct);

router.get('/get-my-category', authMiddleware(['vendor', 'admin']), getMyCategories);
router.get('/get-sub-category-by-category/:type', authMiddleware(['vendor', 'admin']), getSubCategoriesByCategories);
router.get('/product-delete-info/:prod_id', authMiddleware(['vendor', 'admin']), getProductDeleteInfo);
router.delete('/product-delete/:prod_id', authMiddleware(['vendor', 'admin']), deleteProduct);
router.get('/product-get', authMiddleware(['vendor', 'admin']), getVendorProducts);
router.get('/product-detail/:prod_id', authMiddleware(['vendor', 'admin']), detailProduct);
router.patch('/product-status-toggle/:prod_id', authMiddleware(['vendor', 'admin']), toggleProductActive);
router.get('/product-count', authMiddleware(['vendor', 'admin']), countProducts);
router.get('/get-inventory-stats', authMiddleware(['vendor', 'admin']), getInventoryStats);
router.get('/get-top-selling-products', authMiddleware(['vendor', 'admin']), getTopSellingProducts);
router.get('/get-stock-alert', authMiddleware(['vendor', 'admin']), getStockAlerts);

export default router;

import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folderName = 'EasyShop/Others'; // Default folder

        // Check path to decide folder
        if (req.baseUrl.includes('vendor')) {
            folderName = 'EasyShop/Vendor_Docs';
        }

        else if (req.baseUrl.includes('category')) {
            folderName = 'EasyShop/Category';
        }

        else if (req.baseUrl.includes('subCategory')) {
            folderName = 'EasyShop/SubCategory';
        }

        else if (req.baseUrl.includes('product')) {
            folderName = 'EasyShop/Products';
        }

        else if (req.baseUrl.includes('user')) {
            folderName = 'EasyShop/Users'
        }

        else if (req.baseUrl.includes('admin')) {
            folderName = 'EasyShop/Admin'
        }

        return {
            folder: folderName,
            allowed_formats: ['jpg', 'png', 'jpeg'],
            public_id: `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
            transformation: [
                { quality: 'auto:good' },  // auto optimize quality
                { fetch_format: 'auto' },   // serve webp to supported browsers
                { width: 1080, height: 1080, crop: 'limit' } // max size limit
            ]
        };
    },
});

const upload = multer({ storage: storage });

export { upload };
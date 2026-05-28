
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

const bannerStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'EasyShop/Banners',
            allowed_formats: ['jpg', 'png', 'jpeg'],
            public_id: `banner-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
            transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' },
                { width: 1920, height: 600, crop: 'fill', gravity: 'auto' }
            ]
        };
    },
});

const uploadBanner = multer({ storage: bannerStorage });

export { uploadBanner };
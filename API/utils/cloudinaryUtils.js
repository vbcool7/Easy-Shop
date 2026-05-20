
import cloudinary from '../config/cloudinary.js';

//delete file or files - when err occur
export const deleteCloudinaryFiles = async (fileData) => {
    try {
        if (!fileData) return;

        let publicIds = [];

        // Case 1: if single upload
        if (fileData.filename) {
            publicIds.push(fileData.filename);
        }
        // Case 2: multiple fields
        else {
            const allFiles = Object.values(fileData).flat();
            publicIds = allFiles.map(f => f.filename).filter(id => id);
        }

        // dlt all id's
        for (const id of publicIds) {
            await cloudinary.uploader.destroy(id);
            console.log(`Cleanup Done: Deleted ${id} from Cloudinary`);
        }
    } catch (error) {
        console.error("Cloudinary Cleanup Error:", error);
    }
};

// for update api - dlt old files
export const deleteOldFileFromCloudinary = async (fileUrl) => {
    try {
        if (!fileUrl || typeof fileUrl !== 'string') return;

        // decode URL first
        const decodedUrl = decodeURIComponent(fileUrl);

        let publicId = "";

        // METHOD A: Split Logic (Modern & Safe)
        const parts = fileUrl.split('/');
        const uploadIndex = parts.indexOf('upload');

        if (uploadIndex !== -1) {
            const lastPart = parts[parts.length - 1].split('.')[0];
            const folderParts = parts.slice(uploadIndex + 2, parts.length - 1);
            publicId = [...folderParts, lastPart].join('/');
        }

        // METHOD B: Fallback (Agar split logic se ID nahi mili toh regex try karein)
        if (!publicId) {
            const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/;
            const match = fileUrl.match(regex);
            if (match) publicId = match[1];
        }

        if (publicId) {
            const result = await cloudinary.uploader.destroy(publicId);
            console.log(`Cloudinary Delete [${publicId}]:`, result.result);
        }
    } catch (error) {
        console.error("Error in deleteOldFileFromCloudinary:", error);
    }
};

// cleaning Cloudinary files if validation fails
export const cleanupUploadedFiles = async (files) => {
    if (!files) return;
    await deleteCloudinaryFiles(files);
};

// multiple image deletions from Cloudinary - update api
export const deleteGalleryImages = async (imageArray) => {
    try {
        if (imageArray && Array.isArray(imageArray) && imageArray.length > 0) {
            await Promise.all(
                imageArray.map(imgUrl => deleteOldFileFromCloudinary(imgUrl))
            );
            console.log(`Successfully deleted ${imageArray.length} gallery images.`);
        }
    } catch (error) {
        console.error("Error in deleteGalleryImages helper:", error);
    }
};

// Specially for Delete API - Handles URLs and Spaces
export const deleteProductAssetsFromCloudinary = async (urls) => {
    try {
        if (!urls || !Array.isArray(urls) || urls.length === 0) return;

        // reuse existing deleteOldFileFromCloudinary for each URL
        await Promise.all(
            urls.map(url => deleteOldFileFromCloudinary(url))
        );

        console.log(`Processed ${urls.length} images for deletion.`);
    } catch (error) {
        console.error("Error in deleteProductAssetsFromCloudinary:", error);
    }
};
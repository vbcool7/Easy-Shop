
import Banner from '../Models/bannerModelSchema.js';
import { deleteOldFileFromCloudinary, deleteCloudinaryFiles } from '../utils/cloudinaryUtils.js';

// admin side - list
export const getBannersByZone = async (req, res) => {
    try {
        const banners = await Banner.find({ zone: req.params.zone })
            .sort({ order: 1 });

        res.status(200).json({
            success: true,
            message: "Here is banner",
            banners
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// add banner
export const createBanner = async (req, res) => {
    try {
        const image = req.file?.path;
        const banner = await Banner.create({ ...req.body, image });

        res.status(200).json({
            success: true,
            message: "Banner created successfully",
            banner
        });

    } catch (err) {
        console.log("Error :", err);
        if (req.file) await deleteCloudinaryFiles(req.file);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// update banner
export const updateBanner = async (req, res) => {
    try {
        const updateData = { ...req.body };

        const existingBanner = await Banner.findById(req.params.id);

        if (!existingBanner)
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });

        // handle image replacement
        if (req.file?.path) {
            if (existingBanner.image) await deleteOldFileFromCloudinary(existingBanner.image);
            updateData.image = req.file.path;
        }

        // deactivate all others in same zone BEFORE saving
        if (req.body.isActive === 'true') {
            await Banner.updateMany(
                { zone: existingBanner.zone, _id: { $ne: req.params.id } },
                { isActive: false }
            );
        }

        const banner = await Banner.findByIdAndUpdate(req.params.id, updateData, { new: true });

        res.status(200).json({
            success: true,
            message: "Banner updated successfully",
            banner
        });

    } catch (err) {
        console.log("Error :", err);
        if (req.file) await deleteCloudinaryFiles(req.file);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// delete banner
export const deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found",
            });
        }

        if (banner.image) await deleteOldFileFromCloudinary(banner.image);

        await Banner.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            message: "Banner deleted successfully",
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};
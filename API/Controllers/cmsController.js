
import CmsContent from '../Models/cmsModelSchema.js';

export const getCmsContent = async (req, res) => {
    try {
        const content = await CmsContent.findOne({ key: req.params.key });

        if (!content)
            return res.status(404).json({
                success: false,
                message: "Content not found"
            });

        res.status(200).json({
            success: true,
            content
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

export const upsertCmsContent = async (req, res) => {
    try {
        const { title, content, status } = req.body;

        const updated = await CmsContent.findOneAndUpdate(
            { key: req.params.key },
            { $set: { key: req.params.key, title, content, status } },
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            updated
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

import Category from '../Models/categoryModelSchema.js';
import SubCategory from '../Models/subCategoryModelSchema.js';
import { deleteCloudinaryFiles, deleteOldFileFromCloudinary } from '../utils/cloudinaryUtils.js';

export const addSubCategory = async (req, res) => {
    try {
        const { cat_id } = req.params;
        const { subCatName, description, allowedAttributes } = req.body;
        const subCatImagePath = req.file ? req.file.path : "";

        const slug = subCatName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

        if (!subCatName || !slug || !description || !subCatImagePath) {
            if (req.file) await deleteCloudinaryFiles(req.file);
            return res.status(400).json({
                success: false,
                message: "All fields and sub category image are mandatory"
            });
        };

        // check parent cat exists or not
        const categoryExists = await Category.findById(cat_id);
        if (!categoryExists) {
            if (req.file) await deleteCloudinaryFiles(req.file);
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Duplicate check (Specific to THIS category)
        const alreadyExists = await SubCategory.findOne({
            catId: cat_id,
            $or: [
                { subCatName: subCatName.trim() },
                { slug }
            ]
        });

        if (alreadyExists) {
            if (req.file) await deleteCloudinaryFiles(req.file);
            return res.status(400).json({
                success: false,
                message: "Sub-Category name or slug already exists in this category"
            });
        };

        // 2. Parse allowedAttributes if it's coming as a string (happens with FormData)
        let parsedAttributes = [];
        if (allowedAttributes) {
            try {
                parsedAttributes = typeof allowedAttributes === 'string'
                    ? JSON.parse(allowedAttributes)
                    : allowedAttributes;
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid format for allowedAttributes"
                });
            }
        }

        console.log("Parsed Attributes:", parsedAttributes);

        const newSubCategory = new SubCategory({
            catId: cat_id,
            subCatName,
            slug,
            description,
            subCatImage: subCatImagePath,
            allowedAttributes: parsedAttributes // Yahan save ho raha hai
        });

        await newSubCategory.save();
        res.status(201).json({
            success: true,
            message: "Sub-Category added successfully!",
            data: newSubCategory
        });

    } catch (err) {
        if (req.file) await deleteCloudinaryFiles(req.file);
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    };
};

export const listSubCategory = async (req, res) => {
    try {
        const list = await SubCategory.aggregate([
            {
                // 1. Products ke saath link karo count nikalne ke liye
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "subCatId", // Product model mein jo field hai
                    as: "products"
                }
            },
            {
                // 2. Category details lane ke liye (kyunki sub-category kisi category se judi hai)
                $lookup: {
                    from: "categories",
                    localField: "catId",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            { $unwind: "$categoryDetails" }, // Array ko object mein badlo
            {
                $project: {
                    subCatName: 1,
                    subCatImage: 1,
                    allowedAttributes: 1,
                    description: 1,
                    slug: 1,
                    isActive: 1,
                    createdAt: 1,
                    // Ye wahi kaam kar raha hai jo populate karta:
                    catId: "$categoryDetails._id", // Agar aapko ID bhi chahiye
                    catName: "$categoryDetails.catName",
                    department: "$categoryDetails.department",
                    productCount: { $size: "$products" }
                }
            },
        ]).sort({ createdAt: -1 });

        if (!list || list.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No sub-categories found"
            });
        };

        res.status(200).json({
            success: true,
            message: "Here is sub category list",
            count: list.length,
            data: list
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    };
};

export const listSubCatByCategory = async (req, res) => {
    try {
        const { cat_id } = req.params;

        const list = await SubCategory.find({ catId: cat_id }).populate('catId', 'catName slug');

        if (!list || list.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No sub-categories found for this category"
            });
        };

        res.status(200).json({
            success: true,
            message: "Here is sub category list by category",
            count: list.length,
            data: list
        });
        
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    };
};

export const getSubCategory = async (req, res) => {
    try {
        const { subCat_id } = req.params;

        const subCategory = await SubCategory.findById(subCat_id);

        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: "Sub-Category not found"
            });
        };

        res.status(200).json({
            success: true,
            message: "Here is sub-category detail",
            data: subCategory
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    };
};

export const updateSubCategory = async (req, res) => {
    try {
        const { subCat_id } = req.params;
        const { subCatName, description, isActive, allowedAttributes } = req.body;

        const subCategory = await SubCategory.findById(subCat_id);
        if (!subCategory) {
            if (req.file) await deleteCloudinaryFiles(req.file);
            return res.status(404).json({
                success: false,
                message: "Sub Category not found"
            });
        }

        const updates = {};

        // 1. AUTO SLUG GENERATION LOGIC
        if (subCatName) {
            updates.subCatName = subCatName.trim();
            updates.slug = subCatName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

            // 2. DUPLICATE CHECK (exclude yourself kisi aur ka slug match na ho)
            const alreadyExists = await SubCategory.findOne({
                catId: subCategory.catId, // Same category ke andar check karein
                _id: { $ne: subCat_id },   // Khud ki ID ko exclude karein
                $or: [{ subCatName: updates.subCatName }, { slug: updates.slug }]
            });

            if (alreadyExists) {
                if (req.file) await deleteCloudinaryFiles(req.file);
                return res.status(400).json({
                    success: false,
                    message: "Another sub-category with this name/slug already exists"
                });
            }
        }

        // 3. ALLOWED ATTRIBUTES UPDATE
        if (allowedAttributes) {
            try {
                let parsedData;

                if (typeof allowedAttributes === 'string') {
                    
                    if (allowedAttributes.includes("[object Object]")) {
                        throw new Error("Received garbled object string");
                    }
                    parsedData = JSON.parse(allowedAttributes);
                } else {
                    parsedData = allowedAttributes;
                }

                updates.allowedAttributes = parsedData;
            } catch (error) {
                console.error("Parse Error:", error);
                return res.status(400).json({
                    success: false,
                    message: "Invalid format for allowedAttributes. Please send a valid JSON string."
                });
            }
        }

        if (description !== undefined) updates.description = description;
        if (isActive !== undefined) updates.isActive = isActive;

        // 4. IMAGE HANDLING
        if (req.file) {
            if (subCategory.subCatImage) {
                await deleteOldFileFromCloudinary(subCategory.subCatImage);
            }
            updates.subCatImage = req.file.path;
        }

        const updatedSubCategory = await SubCategory.findByIdAndUpdate(
            subCat_id,
            { $set: updates },
            { returnDocument: 'after', runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Sub-Category updated successfully",
            data: updatedSubCategory
        });

    } catch (err) {
        if (req.file) await deleteCloudinaryFiles(req.file);
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

export const deleteSubCategory = async (req, res) => {
    try {
        const { subCat_id } = req.params;
        const subCategory = await SubCategory.findById(subCat_id);

        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: "Sub-Category not found"
            });
        };

        if (subCategory.subCatImage) {
            await deleteOldFileFromCloudinary(subCategory.subCatImage);
        };

        await SubCategory.findByIdAndDelete(subCat_id);
        res.status(200).json({
            success: true,
            message: "Sub-Category deleted successfully",
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    };
};

export const toggleSubCategoryStatus = async (req, res) => {
    try {
        const { subCat_id } = req.params;

        const subCategory = await SubCategory.findById(subCat_id);

        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: "Sub-Category not found"
            });
        };

        subCategory.isActive = !subCategory.isActive;
        await subCategory.save();
        res.status(200).json({
            success: true,
            message: `Sub-Category is now ${subCategory.isActive ? 'Active' : 'Inactive'}`,
            isActive: subCategory.isActive
        });

    } catch (err) {
        // console.log(err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    };
};

export const searchCategoryAndSubCategory = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(404).json({
                success: false,
                message: "Query is required"
            });
        };

        const searchRegex = new RegExp(query, 'i');

        // search in cat
        const categories = await Category.find({
            catName: { $regex: searchRegex },
            isActive: true
        }).select('catName slug catImage').limit(5);

        // search in sub-cat
        const subCategories = await SubCategory.find({
            subCatName: { $regex: searchRegex },
            isActive: true
        }).select('subCatName slug subCatImage catId').populate('catId', 'catName').limit(5);

        res.status(200).json({
            success: true,
            message: "Founded",
            results: {
                categories,
                subCategories
            }
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};
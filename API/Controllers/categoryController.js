
import Category from '../Models/categoryModelSchema.js';
import SubCategory from '../Models/subCategoryModelSchema.js';
import Product from '../Models/productModelSchema.js';
import Order from '../Models/orderModelSchema.js';
import { deleteCloudinaryFiles } from '../utils/cloudinaryUtils.js'; // err
import { deleteOldFileFromCloudinary } from '../utils/cloudinaryUtils.js'; // update + dlt

// admin
export const addCategory = async (req, res) => {
    try {
        const { department, catName, description, requiresCertificate, certificateLabel } = req.body;
        const catImagePath = req.file ? req.file.path : "";

        const slug = catName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

        if (!department || !catName || !catImagePath || !description) {
            if (req.file) await deleteCloudinaryFiles(req.file);
            return res.status(400).json({
                success: false,
                message: "All fields and category image are mandatory"
            });
        };

        if (requiresCertificate === 'true' && !certificateLabel) {
            if (req.file) await deleteCloudinaryFiles(req.file);
            return res.status(400).json({
                success: false,
                message: "Certificate label is required when certificate is enabled"
            });
        }

        const alreadyExists = await Category.findOne({
            $or: [{ catName: catName.trim() }, { slug }]
        });

        if (alreadyExists) {
            if (req.file) await deleteCloudinaryFiles(req.file);
            return res.status(400).json({
                success: false,
                message: "This category already exists"
            });
        };

        const newCategory = new Category({
            department,
            catName,
            slug,
            description,
            catImage: catImagePath,
            requiresCertificate: requiresCertificate === 'true' || requiresCertificate === true,
            certificateLabel: certificateLabel || ""
        });

        await newCategory.save();
        res.status(201).json({
            success: true,
            message: "Category added successfully!",
            data: newCategory
        });

    } catch (err) {
        console.log("Error :", err);
        if (req.file) await deleteCloudinaryFiles(req.file);
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    };
};

export const listCategory = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        const matchStage = search
            ? {
                $match: {
                    $or: [
                        { catName: { $regex: search, $options: 'i' } },
                        { department: { $regex: search, $options: 'i' } },
                        { description: { $regex: search, $options: 'i' } },
                    ]
                }
            }
            : { $match: {} };

        const [result, totalCount] = await Promise.all([
            Category.aggregate([
                matchStage,
                { $lookup: { from: "products", localField: "_id", foreignField: "catId", as: "products" } },
                {
                    $project: {
                        catName: 1, catImage: 1, department: 1, description: 1,
                        slug: 1, isActive: 1, createdAt: 1, requiresCertificate: 1,
                        certificateLabel: 1, productCount: { $size: "$products" }
                    }
                },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: Number(limit) },
            ]),
            Category.countDocuments(search ? {
                $or: [
                    { catName: { $regex: search, $options: 'i' } },
                    { department: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                ]
            } : {})
        ]);

        res.status(200).json({
            success: true,
            count: totalCount,
            totalPages: Math.ceil(totalCount / Number(limit)),
            currentPage: Number(page),
            data: result
        });

    } catch (err) {
        return res.status(500).json({ success: false, message: "Server Error Occur" });
    }
};

export const getCategory = async (req, res) => {
    try {
        const { cat_id } = req.params;

        const category = await Category.findById(cat_id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        };

        res.status(200).json({
            success: true,
            message: "Here is category detail",
            data: category
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    };
};

// admin
export const updateCategory = async (req, res) => {
    try {
        const { cat_id } = req.params;
        const { catName, department, description, isActive, requiresCertificate, certificateLabel } = req.body;

        const category = await Category.findById(cat_id);
        if (!category) {
            if (req.file) await deleteCloudinaryFiles(req.file);
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        const updates = {};

        // 1. AUTO SLUG GENERATION & DUPLICATE CHECK
        if (catName) {
            updates.catName = catName.trim();
            updates.slug = catName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

            // Check if new name/slug conflicts with another category
            const alreadyExists = await Category.findOne({
                _id: { $ne: cat_id }, // Apni ID ko chhod kar baaki check karein
                $or: [{ catName: updates.catName }, { slug: updates.slug }]
            });

            if (alreadyExists) {
                if (req.file) await deleteCloudinaryFiles(req.file);
                return res.status(400).json({
                    success: false,
                    message: "Category with this name or slug already exists"
                });
            }
        }

        // 2. OTHER FIELDS
        if (department) updates.department = department;
        if (description) updates.description = description;
        // if (isActive !== undefined) updates.isActive = isActive;

        if (isActive !== undefined) {
            updates.isActive = isActive === 'true' || isActive === true;
        }

        // requiresCertificate handling
        if (requiresCertificate !== undefined) {
            updates.requiresCertificate = requiresCertificate === 'true' || requiresCertificate === true;
        }

        // Certificate Label logic
        if (certificateLabel !== undefined) {
            updates.certificateLabel = certificateLabel;
        }

        // Extra Validation: Agar update ke baad certificate true hai par label khali hai
        const finalRequiresCert = updates.requiresCertificate !== undefined ? updates.requiresCertificate : category.requiresCertificate;
        const finalLabel = updates.certificateLabel !== undefined ? updates.certificateLabel : category.certificateLabel;

        if (finalRequiresCert && !finalLabel) {
            if (req.file) await deleteCloudinaryFiles(req.file);
            return res.status(400).json({
                success: false,
                message: "Certificate label is required when license is enabled"
            });
        }

        // 3. IMAGE UPDATE LOGIC
        if (req.file) {
            if (category.catImage) {
                await deleteOldFileFromCloudinary(category.catImage);
            }
            updates.catImage = req.file.path;
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            cat_id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: updatedCategory
        });

    } catch (err) {
        if (req.file) await deleteCloudinaryFiles(req.file);
        console.error("Update Category Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occurred"
        });
    }
};

// admin
export const getCategoryDeleteInfo = async (req, res) => {
    try {
        const { cat_id } = req.params;

        const category = await Category.findById(cat_id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        };

        const subCats = await SubCategory.find({ catId: cat_id }).select('_id');
        const subCatIds = subCats.map(s => s._id);

        const productCount = subCatIds.length > 0
            ? await Product.countDocuments({ subCatId: { $in: subCatIds } })
            : 0;

        const productIds = subCatIds.length > 0
            ? await Product.find({ subCatId: { $in: subCatIds } }).select('_id')
            : [];
        const productIdList = productIds.map(p => p._id);

        const orderedProductCount = productIdList.length > 0
            ? await Order.countDocuments({ "items.productId": { $in: productIdList } })
            : 0;

        let message = "";
        let canDelete = false;

        if (orderedProductCount > 0) {
            message = `This category has ${subCats.length} subcategorie(s) and ${productCount} product(s), and some products have existing orders. Deletion is not allowed.`;
        } else if (subCats.length > 0 || productCount > 0) {
            message = `This category has ${subCats.length} subcategorie(s) and ${productCount} product(s). Deleting it will remove all of them.`;
        } else {
            canDelete = true;
            message = `Are you sure you want to delete this category?`;
        }

        return res.status(200).json({
            success: true,
            canDelete,
            message
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    };
};

// admin
export const deleteCategory = async (req, res) => {
    try {
        const { cat_id } = req.params;
        const category = await Category.findById(cat_id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        };

        if (category.catImage) {
            await deleteOldFileFromCloudinary(category.catImage);
        };

        await Category.findByIdAndDelete(cat_id);
        res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    };
};

// admin
export const toggleCategoryStatus = async (req, res) => {
    try {
        const { cat_id } = req.params;

        const category = await Category.findById(cat_id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        };

        category.isActive = !category.isActive;
        await category.save();
        res.status(200).json({
            success: true,
            message: `Category is now ${category.isActive ? 'Active' : 'Inactive'}`,
            isActive: category.isActive // Naya status bhej dein
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    };
};

// recursive - for mega menu
export const getCategoryTree = async (req, res) => {
    try {
        const tree = await Category.aggregate([

            // 1. only active cat
            { $match: { isActive: true } },

            // 2. SubCategories ke saath join karo
            {
                $lookup: {
                    from: "subcategories",
                    localField: "_id",          // Category ID
                    foreignField: "catId",      // catId stored in sub cat
                    as: "subcategories"         // Is naam se array banega
                }
            },

            // 3. Optional: show needed fileds
            {
                $project: {
                    catName: 1,
                    slug: 1,
                    catImage: 1,
                    "subcategories.subCatName": 1,
                    "subcategories.allowedAttributes": 1,
                    "subcategories.slug": 1,
                    "subcategories._id": 1
                }
            },

            // 4. Sort by name or order
            { $sort: { catName: 1 } }
        ]);

        res.status(200).json({
            success: true,
            count: tree.length,
            data: tree
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    };
};
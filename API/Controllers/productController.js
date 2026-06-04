
import Product from '../Models/productModelSchema.js';
import Category from '../Models/categoryModelSchema.js';
import SubCategory from '../Models/subCategoryModelSchema.js';
import Vendor from '../Models/vendorModelSchema.js';
import Order from '../Models/orderModelSchema.js';
import { deleteOldFileFromCloudinary, cleanupUploadedFiles, deleteGalleryImages, deleteProductAssetsFromCloudinary } from '../utils/cloudinaryUtils.js';
import { createAdminNotification } from '../utils/createAdminNotifications.js';
import mongoose from 'mongoose';

export const addProduct = async (req, res) => {
    try {
        const { subCat_id } = req.params;
        const { prodName, description, price, originalPrice, stock, attributes, colorAttrName, colorValues, variants } = req.body;

        // check if color variant product
        const isColorVariant = !!colorAttrName && !!colorValues;

        // 1. Mandatory Fields Check (Sabse Pehle)
        if (!prodName || !description || !price || !originalPrice || !attributes) {
            if (req.files) await cleanupUploadedFiles(req.files);
            return res.status(400).json({
                success: false,
                message: "All fields and primary image are mandatory"
            });
        }

        // for non-color variant, prodImage is required
        if (!isColorVariant) {
            const hasProdImage = req.files?.some(f => f.fieldname === 'prodImage');
            if (!hasProdImage) {
                if (req.files) await cleanupUploadedFiles(req.files);
                return res.status(400).json({
                    success: false,
                    message: "Primary image is mandatory"
                });
            }
        }

        // 2. Fetch SubCategory to get allowedAttributes
        const subCategory = await SubCategory.findById(subCat_id);
        if (!subCategory) {
            if (req.files) await cleanupUploadedFiles(req.files);
            return res.status(404).json({
                success: false,
                message: "Sub-Category not found"
            });
        }

        if (Number(price) > Number(originalPrice)) {
            if (req.files) await cleanupUploadedFiles(req.files);
            return res.status(400).json({
                success: false,
                message: "Sale price cannot be more than MRP"
            });
        }

        let incomingAttrs;
        try {
            incomingAttrs = typeof attributes === 'string'
                ? JSON.parse(attributes)
                : attributes;
        } catch (e) {
            if (req.files) await cleanupUploadedFiles(req.files);
            return res.status(400).json({
                success: false,
                message: "Invalid attributes format"
            });
        }

        let parsedVariants = [];

        try {
            parsedVariants = variants
                ? (typeof variants === "string" ? JSON.parse(variants) : variants)
                : [];
        } catch (e) {
            if (req.files) await cleanupUploadedFiles(req.files);
            return res.status(400).json({
                success: false,
                message: "Invalid variants format"
            });
        }

        let finalStock;

        if (parsedVariants.length > 0) {
            finalStock = parsedVariants.reduce(
                (sum, item) => sum + (Number(item.stock) || 0),
                0
            );
        } else {
            if (stock === undefined || stock === null || stock === "") {
                if (req.files) await cleanupUploadedFiles(req.files);
                return res.status(400).json({
                    success: false,
                    message: "Stock is required"
                });
            }

            finalStock = Number(stock) || 0;

            parsedVariants = [{
                color: null,
                size: null,
                stock: finalStock
            }];
        }

        const allowedKeys = subCategory.allowedAttributes.map(a => a.name);
        const isValid = Object.keys(incomingAttrs).every(key => allowedKeys.includes(key));

        if (!isValid) {
            if (req.files) await cleanupUploadedFiles(req.files);
            return res.status(400).json({
                success: false,
                message: "One or more attributes are invalid for this category"
            });
        }

        // 4. Identity & Slug
        const vendorId = req.user.role === 'vendor' ? req.user.id : null;
        const addedBy = req.user.id;
        const role = req.user.role;
        const baseSlug = prodName
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        // Slug unique banane ke liye vendorId ya timestamp jodna achha hai
        const finalSlug = vendorId ? `${baseSlug}-${vendorId}` : `${baseSlug}-admin`;

        // 5. Duplicate Check
        const prodAlreadyExists = await Product.findOne({ slug: finalSlug, vendorId });
        if (prodAlreadyExists) {
            if (req.files) await cleanupUploadedFiles(req.files);
            return res.status(409).json({
                success: false,
                message: "Product with this name already exists."
            });
        }

        // 6. Handle images
        let prodImage = '';
        let prodImages = [];

        if (isColorVariant) {
            // Parse color values
            let colors = [];
            try {
                colors = typeof colorValues === "string" ? JSON.parse(colorValues) : colorValues;
            } catch (e) {
                if (req.files) await cleanupUploadedFiles(req.files);
                return res.status(400).json({
                    success: false,
                    message: "Invalid color values format"
                });
            }

            // Group uploaded files by color { Red: [url1, url2], Pink: [url3] }
            const colorImagesMap = {};

            (req.files || []).forEach(file => {
                // fieldname: colorImg_Pastel Pink_0
                if (file.fieldname.startsWith('colorImg_')) {
                    const firstUnderscoreIdx = file.fieldname.indexOf('_');
                    const lastUnderscoreIdx = file.fieldname.lastIndexOf('_');
                    const colorName = file.fieldname.substring(firstUnderscoreIdx + 1, lastUnderscoreIdx);

                    if (!colorImagesMap[colorName]) colorImagesMap[colorName] = [];
                    colorImagesMap[colorName].push(file.path); // cloudinary URL
                }
            });

            // Store color images in attributes
            incomingAttrs[colorAttrName] = {
                ...incomingAttrs[colorAttrName],
                images: colorImagesMap
            };

            // Set prodImage and prodImages from first color's images
            const firstColor = colors[0];
            const firstColorImages = colorImagesMap[firstColor] || [];

            prodImage = firstColorImages[0] || '';
            prodImages = firstColorImages.slice(1);

            if (!prodImage) {
                if (req.files) await cleanupUploadedFiles(req.files);
                return res.status(400).json({
                    success: false,
                    message: "At least one image is required for the first color"
                });
            }

        } else {
            // Non-color variant — existing logic
            prodImage = (req.files || []).find(f => f.fieldname === 'prodImage')?.path || '';
            prodImages = (req.files || [])
                .filter(f => f.fieldname === 'prodImages')
                .map(f => f.path);
        }

        const newProduct = new Product({
            vendorId,
            catId: subCategory.catId,
            subCatId: subCat_id,
            prodName,
            slug: finalSlug,
            description,
            prodImage,
            prodImages,
            price,
            originalPrice,
            stock: finalStock,
            variants: parsedVariants,
            attributes: incomingAttrs,
            addedBy,
            role,
            status: role === 'Admin' ? 'Approved' : 'Pending'
        });

        await newProduct.save();

        if (role === 'vendor') {
            await createAdminNotification({
                type: "NEW_PRODUCT",
                title: "New Product Added",
                message: `Vendor submitted a new product "${prodName}" for approval.`,
                relatedId: newProduct._id,
            });
        }

        res.status(201).json({
            success: true,
            message: "Product added successfully",
            data: newProduct
        });

    } catch (err) {
        console.error("Add Product Error:", err);
        if (req.files) await cleanupUploadedFiles(req.files);
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    };
};

// all products - user
export const allProductList = async (req, res) => {
    try {
        const { catId, subCatId, vendorId, isNewArrival, isBestSeller, sort, minPrice, maxPrice, ...filters } = req.query;

        let query = { status: "Approved", isActive: true };
        let sortQuery = { createdAt: -1 };

        // cat/subcat filter
        if (catId && catId !== 'undefined') query.catId = catId;
        if (subCatId && subCatId !== 'undefined') query.subCatId = subCatId;
        if (vendorId && vendorId !== 'undefined') query.vendorId = vendorId;

        // price range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // arrival and best seller
        if (isNewArrival === "true") query.isNewArrival = true;
        if (isBestSeller === "true") query.isBestSeller = true;

        // sorting
        if (sort === "priceLow") sortQuery = { price: 1 };
        if (sort === "priceHigh") sortQuery = { price: -1 };
        if (sort === "bestSeller") sortQuery = { totalSold: -1 };

        // Dynamic Attributes Filtering
        const attrConditions = [];

        Object.keys(filters).forEach((key) => {
            const value = filters[key];

            if (value) {
                attrConditions.push({
                    $or: [
                        { [`attributes.${key}`]: value },
                        { [`attributes.${key}.values`]: value }
                    ]
                });
            }
        });

        if (attrConditions.length > 0) {
            query.$and = attrConditions;
        }

        const products = await Product.find(query).sort(sortQuery).populate('vendorId');

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });

    } catch (err) {
        console.error("List fetching Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    };
};

// filter sidebar - user
export const getProductFilterOptions = async (req, res) => {
    try {
        const { catId } = req.params;
        const { subCatId } = req.query;

        const query = {
            catId,
            status: 'Approved',
            isActive: true
        };

        // if subcat selected, filter by it
        if (subCatId && subCatId !== 'undefined') query.subCatId = subCatId;

        const products = await Product.find(query).select('attributes');

        const filterOptions = {};

        const getAttributeValues = (value) => {
            if (value && typeof value === "object" && Array.isArray(value.values)) {
                return value.values;
            }

            if (Array.isArray(value)) {
                return value;
            }

            if (value !== undefined && value !== null && value !== "") {
                return [value];
            }

            return [];
        };

        products.forEach(product => {
            if (!product.attributes) return;

            product.attributes.forEach((value, key) => {
                const values = getAttributeValues(value);

                if (!filterOptions[key]) {
                    filterOptions[key] = new Set();
                }

                values.forEach(item => {
                    if (item !== undefined && item !== null && item !== "") {
                        filterOptions[key].add(String(item));
                    }
                });
            });
        });

        // convert Sets to arrays
        const result = {};

        Object.entries(filterOptions).forEach(([key, valueSet]) => {
            result[key] = Array.from(valueSet);
        });

        return res.status(200).json({
            success: true,
            message: "Here is result",
            data: result
        });

    } catch (err) {
        console.error("Filter options error:", err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// user - prod detail
export const detailProductPublic = async (req, res) => {
    try {
        const { prod_id } = req.params;

        const product = await Product.findOne({
            _id: prod_id,
            isActive: true,
            status: 'Approved'
        })
            .populate('subCatId', 'subCatName')
            .populate('catId', 'catName')
            .populate('vendorId', 'storeLogo storeName aboutShop address city state pincode businessEmail businessContact');

        if (!product) {
            res.status(404).json({
                success: false,
                message: "Product not found or currently unavailable"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product detail fetched successfully",
            data: product
        });

    } catch (err) {
        console.log("Error: ", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    };
};

// user
export const getSimilarProducts = async (req, res) => {
    try {
        const { prod_id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(prod_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(prod_id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        let similarProducts = await Product.find({
            subCatId: product.subCatId,
            _id: { $ne: prod_id },
            status: 'Approved',
            isActive: true
        })
            .select('prodName prodImage price description originalPrice averageRating totalReviews slug')
            .limit(5);

        // Backup Plan - if prods not enough then fall into cat
        if (similarProducts.length < 4) {
            similarProducts = await Product.find({
                catId: product.catId,
                _id: { $ne: prod_id },
                status: 'Approved',
                isActive: true
            })
                .select('prodName prodImage price description originalPrice averageRating totalReviews slug')
                .limit(5);
        }

        res.status(200).json({
            success: true,
            message: "Here are similar products",
            data: similarProducts
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// user - vendor shop prods
export const getVendorShopProducts = async (req, res) => {
    try {
        const { vendor_id } = req.params;

        // 1. get page or limit from frontend
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4;

        // 2. skip cal
        const skip = (page - 1) * limit;

        // 3.
        const products = await Product.find({
            vendorId: vendor_id,
            isActive: true,
            status: 'Approved',
        })
            .skip(skip)
            .limit(limit)
            .select('prodName prodImage price originalPrice averageRating totalReviews slug variants attributes')
            .sort({ createdAt: -1 });

        // 4. count total prods
        const totalProducts = await Product.countDocuments({ vendorId: vendor_id });
        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({
            success: true,
            message: "Specific vendor's shop products",
            data: products,
            totalPages,
            currentPage: page
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// vendor - prod list
export const getVendorProducts = async (req, res) => {
    try {
        const { search, page = 1, limit = 10, isActive } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        let query = {};

        if (req.user.role === 'vendor') {
            query.addedBy = req.user.id;
        } else if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Access Denied" });
        }

        if (isActive !== undefined && isActive !== '') {
            query.isActive = isActive === 'true';
        }

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            const approvalStatuses = ['Approved', 'Pending', 'Rejected'].filter(s => searchRegex.test(s));

            const orConditions = [{ prodName: searchRegex }];
            if (approvalStatuses.length) orConditions.push({ status: { $in: approvalStatuses } });

            query.$or = orConditions;
        }

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate("catId", "catName")
                .populate("subCatId", "subCatName")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Product.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            count: total,
            totalPages: Math.ceil(total / parseInt(limit)),
            data: products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error Occur" });
    }
};

export const detailProduct = async (req, res) => {
    try {
        const { prod_id } = req.params;

        const product = await Product.findById(prod_id);
        if (!product) {
            res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Ownership Check
        const ownerId = product.vendorId || product.addedBy;

        if (req.user.role !== 'admin' && ownerId?.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access Denied! You can only watch out your own products."
            });
        }

        res.status(200).json({
            success: true,
            message: `Here is ${req.user.role}'s product detail`,
            data: product
        });

    } catch (err) {
        console.log("Error: ", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    };
};

// edit prod - admin + vendor
export const updateProduct = async (req, res) => {
    try {
        const { prod_id } = req.params;
        const { prodName, description, price, originalPrice, stock, isActive, variants, colorAttrName, colorValues } = req.body;

        const updates = {};

        const product = await Product.findById(prod_id);
        if (!product) {
            if (req.files) await cleanupUploadedFiles(req.files);
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (req.user.role !== 'admin' && product.vendorId.toString() !== req.user.id.toString()) {
            if (req.files) await cleanupUploadedFiles(req.files);
            return res.status(403).json({
                success: false,
                message: "Access Denied!"
            });
        }

        if (req.user.role === 'vendor') updates.status = 'Pending';

        if (prodName) {
            updates.prodName = prodName.trim();
            updates.slug = prodName.toLowerCase().trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');

            const alreadyExists = await Product.findOne({
                _id: { $ne: prod_id },
                $or: [{ prodName: updates.prodName }, { slug: updates.slug }]
            });

            if (alreadyExists) {
                if (req.files) await cleanupUploadedFiles(req.files);
                return res.status(400).json({
                    success: false,
                    message: "Product with this name already exists"
                });
            }
        }

        // attributes
        if (req.body.attributes) {
            try {
                updates.attributes = typeof req.body.attributes === 'string'
                    ? JSON.parse(req.body.attributes)
                    : req.body.attributes;
            } catch (error) {
                if (req.files) await cleanupUploadedFiles(req.files);
                return res.status(400).json({
                    success: false,
                    message: "Invalid attributes format"
                });
            }
        }

        // variants
        if (variants) {
            try {
                const parsedVariants = typeof variants === 'string'
                    ? JSON.parse(variants)
                    : variants;

                updates.variants = parsedVariants;

                // recalculate total stock from variants
                updates.stock = parsedVariants.reduce(
                    (sum, v) => sum + (Number(v.stock) || 0), 0
                );
            } catch (error) {
                if (req.files) await cleanupUploadedFiles(req.files);
                return res.status(400).json({
                    success: false,
                    message: "Invalid variants format"
                });
            }
        } else if (stock !== undefined) {
            updates.stock = stock;
        }

        if (description !== undefined) updates.description = description;
        if (price !== undefined) updates.price = price;
        if (originalPrice !== undefined) updates.originalPrice = originalPrice;
        if (isActive !== undefined) updates.isActive = isActive;

        // handle images
        const isColorVariant = !!colorAttrName && !!colorValues;

        if (isColorVariant) {
            // 1. Current images fetch karein database se
            const existingColorImages =
                product.attributes?.get?.(colorAttrName)?.images ||
                product.attributes?.[colorAttrName]?.images ||
                {};

            const newColors = typeof colorValues === 'string' ? JSON.parse(colorValues) : colorValues;
            const existingColors = Object.keys(existingColorImages);

            // 2. Identify and Delete Removed Colors' Images (Yeh hamesha chalega)
            const removedColors = existingColors.filter(c => !newColors.includes(c));

            for (const removedColor of removedColors) {
                const imagesToDelete = existingColorImages[removedColor] || [];
                if (imagesToDelete.length > 0) {
                    await deleteGalleryImages(imagesToDelete); // Cloudinary Cleanup
                }
            }

            // 3. Update the local map (Removed colors ko map se hatayein)
            const colorImagesMap = { ...existingColorImages };
            removedColors.forEach(c => delete colorImagesMap[c]);

            // 4. Handle New File Uploads
            if ((req.files || []).length > 0) {
                const filesByColor = {};
                req.files.forEach(file => {
                    if (file.fieldname.startsWith("colorImg_")) {
                        const colorName = file.fieldname
                            .replace("colorImg_", "")
                            .replace(/_\d+$/, "");

                        if (!filesByColor[colorName]) filesByColor[colorName] = [];
                        filesByColor[colorName].push(file.path);
                    }
                });

                for (const [colorName, newImageUrls] of Object.entries(filesByColor)) {
                    const oldImageUrls = colorImagesMap[colorName] || [];
                    if (oldImageUrls.length > 0) {
                        await deleteGalleryImages(oldImageUrls); // Purani replace karein
                    }
                    colorImagesMap[colorName] = newImageUrls;
                }
            }

            // 5. Sync with updates.attributes
            if (updates.attributes && updates.attributes[colorAttrName]) {
                updates.attributes[colorAttrName].images = colorImagesMap;
            }

            // 6. ProdImage Update (Sky Blue add hone par thumbnail update)
            const colorsArray = typeof colorValues === "string" ? JSON.parse(colorValues) : colorValues;
            const firstColorImages = colorImagesMap[colorsArray[0]] || [];
            if (firstColorImages.length > 0) {
                updates.prodImage = firstColorImages[0];
                updates.prodImages = firstColorImages.slice(1);
            }

        } else if ((req.files || []).length > 0) {
            // Simple Product Image Logic (Bina color variant wala)
            const files = req.files || [];
            const prodImageFile = files.find(f => f.fieldname === "prodImage");
            const prodImagesFiles = files.filter(f => f.fieldname === "prodImages");

            if (prodImageFile) {
                if (product.prodImage) await deleteOldFileFromCloudinary(product.prodImage);
                updates.prodImage = prodImageFile.path;
            }

            if (prodImagesFiles.length > 0) {
                if (product.prodImages?.length > 0) await deleteGalleryImages(product.prodImages);
                updates.prodImages = prodImagesFiles.map(f => f.path);
            }
        }

        // Final Save
        const updatedProduct = await Product.findByIdAndUpdate(
            prod_id,
            { $set: updates },
            { returnDocument: 'after', runValidators: true }
        );

        if (req.user.role === 'vendor') {
            await createAdminNotification({
                type: "NEW_PRODUCT",
                title: "Product Updated — Pending Review",
                message: `Vendor updated product "${updatedProduct.prodName}" — requires re-approval.`,
                relatedId: updatedProduct._id,
            });
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct
        });

    } catch (err) {
        console.error("Full Error Details:", JSON.stringify(err, null, 2));
        console.error("Error:", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

export const getMyCategories = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.user.id);

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found"
            });
        }

        const categories = await Category.find({ type: vendor.vendorType });

        res.status(200).json({
            success: true,
            message: "Here is vendor's category",
            data: categories
        });
    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Error"
        });
    }
};

export const getSubCategoriesByCategories = async (req, res) => {
    try {
        const { type } = req.params; // Maslan: "Electronics"

        // 1. Pehle 'Category' collection mein jaao aur us name/type ki ID nikalo
        const category = await Category.findOne({
            catName: { $regex: new RegExp(`^${type}$`, "i") }
        });

        if (!category) {
            return res.status(200).json({ success: true, data: [] });
        }

        // 2. Ab 'SubCategory' collection mein 'catId' se find karo
        const subCategories = await SubCategory.find({ catId: category._id });

        console.log(`Found ${subCategories.length} sub-categories for ${type}`);

        res.status(200).json({
            success: true,
            data: subCategories
        });

    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// dlt info
export const getProductDeleteInfo = async (req, res) => {
    try {
        const { prod_id } = req.params;

        const product = await Product.findById(prod_id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        };

        // Ownership Check
        const userId = req.user._id || req.user.id;
        if (req.user.role !== 'admin' && product.vendorId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access Denied! You can only delete your own products."
            });
        }

        const orderedProductCount = await Order.countDocuments({
            "items.productId": prod_id
        });

        const canDelete = orderedProductCount === 0;
        const message = orderedProductCount > 0
            ? "This product has existing orders. Deletion is not allowed."
            : "Are you sure you want to delete this product?";

        return res.status(200).json({
            success: true,
            canDelete,
            message
        });

    } catch (err) {
        console.log("Error : ", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    };
};

// only admin dlt prod
export const deleteProduct = async (req, res) => {
    try {
        const { prod_id } = req.params;

        const product = await Product.findById(prod_id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Ownership Check
        const userId = req.user._id || req.user.id;
        if (req.user.role !== 'admin' && product.vendorId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access Denied! You can only delete your own products."
            });
        }

        // --- CLOUDINARY CLEANUP START ---
        const imagesToDelete = new Set();

        // 1. Main Thumbnail aur Gallery Images
        if (product.prodImage) imagesToDelete.add(product.prodImage);
        if (product.prodImages?.length > 0) {
            product.prodImages.forEach(img => imagesToDelete.add(img));
        }

        // 2. All Variants (Color, Size, etc.) ki images nikalne ke liye deep loop
        let attributes = {};

        if (product.attributes instanceof Map) {
            attributes = Object.fromEntries(product.attributes);
        } else {
            attributes = product.toObject().attributes || {};
        }

        Object.keys(attributes).forEach(attrKey => {
            const attributeValue = attributes[attrKey];

            // Check karein agar is attribute ke andar 'images' object hai
            if (attributeValue && attributeValue.images && typeof attributeValue.images === 'object') {

                // attributeValue.images ke andar har color/variant ki array hoti hai
                Object.values(attributeValue.images).forEach(imageArray => {
                    if (Array.isArray(imageArray)) {
                        imageArray.forEach(url => {
                            if (url && typeof url === 'string') imagesToDelete.add(url);
                        });
                    }
                });
            }
        });

        // 3. Ab dedicated function ko saari unique URLs bhej dein
        if (imagesToDelete.size > 0) {
            const finalUrls = Array.from(imagesToDelete);
            console.log(`Total unique images found for deletion: ${finalUrls.length}`);
            await deleteProductAssetsFromCloudinary(finalUrls);
        }
        // --- CLOUDINARY CLEANUP END ---

        await Product.findByIdAndDelete(prod_id);

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });

    } catch (err) {
        console.log("Error : ", err);
        res.status(500).json({
            status: false,
            message: "Server Error Occur"
        });
    }
};

// vendor - agar admin side se prod approve ho gya but vendor k pass stock nhi h to wo inactive kr skta h
export const toggleProductActive = async (req, res) => {
    try {
        const { prod_id } = req.params;

        const product = await Product.findById(prod_id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        };

        // Ownership Check
        const ownerId = product.vendorId || product.addedBy;

        if (req.user.role !== 'admin' && ownerId?.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access Denied! You can only active or inactive your own products."
            });
        }

        product.isActive = !product.isActive;
        await product.save();

        res.status(200).json({
            status: true,
            message: `Product is now ${product.isActive ? "Active" : "Inactive"}`,
            isActive: product.isActive
        });

    } catch (err) {
        console.log("Error : ", err);
        res.status(500).json({
            status: false,
            message: "Server Error Occur"
        });
    };
};

export const countProducts = async (req, res) => {
    try {
        const filter = req.user.role === 'admin' ? {} : { $or: [{ vendorId: req.user.id }, { addedBy: req.user.id }] };

        const product = await Product.countDocuments(filter);
        res.status(200).json({
            success: true,
            message: "Total Products are : ",
            data: product
        });
    } catch (err) {
        console.log("Error: ", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        })
    }
};

// for search bar
export const getFilteredProducts = async (req, res) => {
    try {
        const { search, sort, catId, subCatId, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

        // Base Query (Sirf wahi jo approved aur active hain
        let query = { isActive: true, status: "Approved" };

        // Search Logic (Name ya Description mein search karega)
        if (search) {
            query.$or = [
                { prodName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // cat and subcat filter
        if (catId) query.catId = catId;
        if (subCatId) query.subCatId = subCatId;

        // price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // price sort filter
        let sortQuery = { createdAt: -1 };
        if (sort === 'priceLow') sortQuery = { price: 1 };
        if (sort === 'priceHigh') sortQuery = { price: -1 };

        // 6. Pagination & Execution
        const skip = (page - 1) * limit;

        const products = await Product.find(query)
            .sort(sortQuery)
            .skip(skip)
            .limit(Number(limit));

        // 7. Total Count (Frontend pagination ke liye)
        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            pages: Math.ceil(total / limit),
            data: products
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            status: false,
            message: "Serever Error Occur"
        });
    }
};

// stock inventory - vendor dashboard
export const getInventoryStats = async (req, res) => {
    try {
        let filter = {};

        // VENDOR FILTER FIX:
        if (req.user.role === 'vendor') {
            filter = { vendorId: new mongoose.Types.ObjectId(req.user.id) };
        }

        const stats = await Product.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalInventory: { $sum: "$stock" },
                    inventoryValue: { $sum: { $multiply: ["$price", "$stock"] } },
                    lowStockAlert: {
                        $sum: { $cond: [{ $lte: ["$stock", 20] }, 1, 0] }
                    },
                    outOfStock: {
                        $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] }
                    }
                }
            }
        ]);

        const defaultStats = {
            totalInventory: 0,
            inventoryValue: 0,
            lowStockAlert: 0,
            outOfStock: 0
        };

        res.status(200).json({
            success: true,
            data: stats.length > 0 ? stats[0] : defaultStats
        });

    } catch (err) {
        console.error("Stats Error:", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// top selling prods - vendor dashboard
export const getTopSellingProducts = async (req, res) => {
    try {
        const vId = new mongoose.Types.ObjectId(req.user.id);

        const topProducts = await Product.find(
            { vendorId: vId, status: "Approved", totalSold: { $gt: 0 } },
            { prodName: 1, prodImage: 1, price: 1, totalSold: 1 }
        )
            .sort({ totalSold: -1 })
            .limit(5)
            .lean();

        res.status(200).json({
            success: true,
            message: "Here is top selling prods list",
            data: topProducts
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// stock alert - vendor dashboard
export const getStockAlerts = async (req, res) => {
    try {
        const vendorId = req.user.id;

        const alerts = await Product.find({
            vendorId: vendorId,
            stock: { $lte: 20 }, // 20 ya usse kam wale saare 'Low' aur 'Critical' products
            isActive: true
        })
            .sort({ stock: 1 });

        res.status(200).json({
            success: true,
            message: "Here is data",
            // Virtual 'stockStatus' automatic JSON mein include ho jayega
            data: alerts
        });
    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// search bar - home
export const getSearchSuggestions = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.trim() === "") {
            return res.status(200).json([]);
        }

        const searchRegex = new RegExp(query, 'i');

        const suggestions = await Product.find({
            $or: [
                { prodName: searchRegex },
                { description: searchRegex }
            ]
        })
            .select("prodName prodImage price description")
            .limit(6);

        res.status(200).json(suggestions);

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};